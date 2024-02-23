const ccxt = require("ccxt");
const exchange = new ccxt.binance();
const Order = require("../models/order");
const Transaction = require("../models/transaction");
const Wallet = require("../models/wallet");
const { doBuy, doSell } = require("../libs/wallet");
const WebSocket = require("ws");

const fetchTicker = async (req, res) => {
  try {
    let { ticker } = req.body;
    ticker = ticker.split("_");

    const data = await exchange.fetchTicker(ticker[0] + "/" + ticker[1]);
    if (data) {
      res.send(data);
    } else {
      res.json({
        error: true,
        message: "Authorization failed",
      });
    }
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

const fetchMarkets = async (req, res) => {
  try {
    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    let filtered = marketKeys.filter((marketKeys) =>
      marketKeys.includes("/USDT")
    );

    let data = filtered.map((symbol) => {
      let temp = marketValues.find((s) => {
        return s.symbol === symbol;
      });
      symbol = temp.symbol.split("/")[0] + "_" + temp.symbol.split("/")[1];
      return {
        symbol: symbol,
        priceChangePercent: temp.info.priceChangePercent,
        highPrice: temp.info.highPrice,
        lowPrice: temp.info.lowPrice,
        quoteVolume: temp.info.quoteVolume,
        currentPrice: temp.info.lastPrice,
      };
    });

    if (data) {
      res.json(data);
    } else {
      res.json({
        error: true,
        message: "Load Market Failed",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const webSocketBinance = async (req, res) => {
  console.log("Hi");

  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/btcusdt@bookTicker`
  );

  const webSocketPromise = new Promise((resolve) => {
    ws.onmessage = (event) => {
      let objectData = JSON.parse(event.data);
      let { b: bidprice, a: askprice, s: symbol } = objectData;
      // console.log(symbol + "," + bidprice + "," + askprice);
      bid = bidprice;
      ask = askprice;
      resolve({ symbol: symbol, bid: bidprice, ask: askprice });
      ws.close();
    };
  });

  let data = await webSocketPromise;
  return data;
};

const fetchTrigger = async () => {
  let response;
  try {
    let pendingOrder = await Order.find({ status: "Pending" });

    if (pendingOrder) {
      // console.log("-----------------------------------------------------------");
      const resultPromise = [];
      pendingOrder.map(async (order) => {
        const triggerPromise = new Promise((resolve) => {
          let result;
          let pair = order.pair.split("_")[0] + order.pair.split("_")[1];
          const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@ticker`
          );
          if (pair) {
            const webSocketPromise = new Promise((resolve) => {
              ws.onmessage = (event) => {
                let objectData = JSON.parse(event.data);
                let { b: bidprice, a: askprice, s: symbol } = objectData;
                resolve({ symbol: symbol, bid: bidprice, ask: askprice });
                ws.close();
              };
            });

            webSocketPromise.then((value) => {
              checkTrigger(value.symbol, value.bid, value.ask);
            });

            const checkTrigger = async (symbol, bid, ask) => {
              const thisOrder = await Order.findOne({
                _id: order._id,
                status: "Pending",
              });
              if (thisOrder) {
                if (thisOrder.side === "buy") {
                  if (ask <= thisOrder.avgPrice) {
                    result = await doBuy(
                      thisOrder.user_id,
                      thisOrder.wallet_id,
                      thisOrder.type,
                      thisOrder.avgPrice,
                      thisOrder.total,
                      thisOrder.pair,
                      thisOrder.amount,
                      thisOrder.fee
                    );
                    if (result.error) {
                      response = result;
                      resolve(response);
                    } else {
                      const transactionResult = await Transaction.create({
                        pair: thisOrder.pair,
                        type: thisOrder.type,
                        side: thisOrder.side,
                        amount: thisOrder.amount,
                        avgPrice: thisOrder.avgPrice,
                        fee: thisOrder.fee,
                        total: thisOrder.total,
                        order_id: thisOrder._id,
                        status: "Filled",
                      });

                      if (transactionResult) {
                        const orderResult = await Order.findOneAndUpdate(
                          {
                            _id: thisOrder._id,
                          },
                          { $set: { status: "Filled", createTime: Date.now() } }
                        );
                        if (orderResult) {
                          resolve({
                            result: true,
                            status: "trigger success",
                          });
                        } else {
                          response = {
                            error: true,
                            message: "Cannot Create Order",
                          };
                          resolve(response);
                        }
                      } else {
                        response = {
                          error: true,
                          message: "Cannot Create Transaction",
                        };
                        resolve(response);
                      }

                      //remove pending
                    }
                  } else {
                    resolve({
                      side: "buy",
                      symbol: symbol,
                      trigger: parseFloat(thisOrder.avgPrice),
                      price: ask,
                    });
                  }
                }
                if (thisOrder.side === "sell") {
                  if (bid >= thisOrder.avgPrice) {
                    result = await doSell(
                      thisOrder.user_id,
                      thisOrder.wallet_id,
                      thisOrder.type,
                      thisOrder.avgPrice,
                      thisOrder.total,
                      thisOrder.pair,
                      thisOrder.amount,
                      thisOrder.fee
                    );
                    if (result.error) {
                      response = result;
                      resolve(response);
                    } else {
                      const transactionResult = await Transaction.create({
                        pair: thisOrder.pair,
                        type: thisOrder.type,
                        side: thisOrder.side,
                        amount: thisOrder.amount,
                        avgPrice: thisOrder.avgPrice,
                        fee: thisOrder.fee,
                        total: thisOrder.total,
                        order_id: thisOrder._id,
                        status: "Filled",
                      });

                      if (transactionResult) {
                        const orderResult = await Order.findOneAndUpdate(
                          {
                            _id: thisOrder._id,
                          },
                          { $set: { status: "Filled", createTime: Date.now() } }
                        );

                        // const orderResult = await Order.create({
                        //   _id: thisOrder._id,
                        //   pair: thisOrder.pair,
                        //   type: thisOrder.type,
                        //   side: thisOrder.side,
                        //   amount: thisOrder.amount,
                        //   avgPrice: thisOrder.avgPrice,
                        //   fee: thisOrder.fee,
                        //   total: thisOrder.total,
                        //   status: "Filled",
                        //   wallet_id: thisOrder.wallet_id,
                        //   user_id: thisOrder.user_id,
                        // });

                        //remove pending
                        if (orderResult) {
                          // await Order.findOneAndDelete({
                          //   _id: thisOrder._id,
                          // });
                          // response = orderResult;
                          resolve({
                            result: true,
                            status: "trigger success",
                          });
                        } else {
                          response = {
                            error: true,
                            message: "Cannot Create Order",
                          };
                          resolve(response);
                        }
                      } else {
                        response = {
                          error: true,
                          message: "Cannot Create Transaction",
                        };
                        resolve(response);
                      }
                    }
                  } else {
                    resolve({
                      side: "sell",
                      symbol: symbol,
                      trigger: parseFloat(thisOrder.avgPrice),
                      price: bid,
                    });
                  }
                }
              } else {
                response = {
                  error: true,
                  message: "This Order hasbeen deleted",
                };
                // console.log(response);
                resolve(response);
              }
            };
          }
        });
        resultPromise.push(triggerPromise);
      });

      let data = await Promise.all(resultPromise);
      return data;
    } else {
      response = {
        error: true,
        message: "No order pending",
      };
      return response;
    }
  } catch (e) {
    response = {
      error: true,
      message: e.message,
    };
    console.log(e);
  }
};

const fetchWalletPnlRanking = async (req, res) => {
  try {
    let response;

    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    const wallets = await Wallet.find();

    if (wallets) {
      let allWalletDetails = wallets.map((wallet) => {
        let totalBalance = 0;
        let coinsData;
        if (wallet.coins != null) {
          coinsData = wallet.coins.map((coin) => {
            let temp = marketValues.find((s) => {
              return s.symbol === coin.name + "/USDT";
            });
            let total = coin.amount * temp.info.lastPrice;
            totalBalance = total + totalBalance;
            return { ...coin, currentPrice: temp.info.lastPrice, total: total };
          });
          if (coinsData) {
            // console.log("havecoins");
            totalBalance = totalBalance + parseFloat(wallet.balance);
            pnl = (totalBalance / parseFloat(wallet.deposit)) * 100 - 100;
            return (walletData = {
              wallet_id: wallet._id,
              user_id: wallet.user_id,
              name: wallet.name,
              deposit: parseFloat(wallet.deposit),
              balance: parseFloat(wallet.balance),
              storeBalance: parseFloat(wallet.storeBalance),
              coins: coinsData,
              totalBalance: totalBalance,
              PNL: pnl,
              createTime: wallet.createTime,
            });
          } else {
            response = {
              error: true,
              message: "404 not found",
            };
          }
        } else {
          // console.log("nocoins");
          totalBalance = totalBalance + parseFloat(wallet.balance);
          pnl = (totalBalance / parseFloat(wallet.deposit)) * 100 - 100;
          return (walletData = {
            wallet_id: wallet._id,
            user_id: wallet.user_id,
            name: wallet.name,
            deposit: parseFloat(wallet.deposit),
            balance: parseFloat(wallet.balance),
            storeBalance: parseFloat(wallet.storeBalance),
            coins: null,
            totalBalance: parseFloat(wallet.balance),
            PNL: pnl,
            createTime: wallet.createTime,
          });
        }
      });

      response = allWalletDetails.sort((pnl1, pnl2) => pnl2.PNL - pnl1.PNL);
    } else {
      response = {
        error: true,
        message: "Please Create Wallet",
      };
    }

    res.json(response);
  } catch (e) {
    res.json({
      error: true,
      message: "Something went wrong",
    });
    console.log(e);
  }
};

module.exports = {
  fetchTicker,
  webSocketBinance,
  fetchMarkets,
  fetchTrigger,
  fetchWalletPnlRanking,
};
