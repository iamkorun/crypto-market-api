const Wallet = require("../models/wallet");
const Order = require("../models/order");
const Transaction = require("../models/transaction");
const ccxt = require("ccxt");
const exchange = new ccxt.binance();

const createWallet = async (req, res) => {
  try {
    const { name, balance } = req.body;
    const user_id = req.decoded.id;
    let error = false;
    let response;

    if (!balance) {
      error = true;
      response = {
        error: true,
        message: "กรุณากรอกจำนวน",
      };
    }

    if (!name) {
      error = true;
      response = {
        error: true,
        message: "กรุณากรอกชื่อ",
      };
    }

    // const walletExists = await Wallet.findOne({ user_id });

    // if (walletExists) {
    //   error = true;
    //   response = {
    //     error: true,
    //     message: "คุณมี wallet อยู่แล้ว",
    //   };
    // }

    if (balance < 10) {
      error = true;
      response = {
        error: true,
        message: "ยอดขั้นต่ำจำนวนเงินแรกเข้า 10 $",
      };
    }

    // Create wallet
    if (!error) {
      let deposit = balance;
      let storeBalance = balance;
      const wallet = await Wallet.create({
        name,
        deposit,
        balance,
        storeBalance,
        user_id,
      });
      if (wallet) {
        response = {
          result: true,
        };
      }
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

const getWalletById = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);
    const wallet_id = req.params.id;
    const wallet = await Wallet.findOne({ user_id: _id.id, _id: wallet_id });

    if (wallet) {
      res.json(wallet);
      // console.log(wallet);
    } else {
      res.json({
        error: true,
        message: "404 not found",
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

const getAllWallet = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);
    const wallet = await Wallet.find({ user_id: _id.id });

    if (wallet) {
      // let totalBalance = 0;
      // wallet.map((item) => {
      //   totalBalance += parseFloat(item.balance);
      // });
      // res.json(totalBalance);
      res.json(wallet);
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

const getWalletDetailsById = async (req, res) => {
  try {
    // const { id } = req.body
    // const wallet = await Wallet.findOne({ id }
    const wallet_id = req.params.id;
    const _id = req.decoded;
    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    const wallet = await Wallet.findOne({ user_id: _id.id, _id: wallet_id });

    // const tickerProcess = wallet.coins.map(async (coin) => {
    //   const coinTotal = await exchange.fetchTicker(coin.name + "/USDT");
    //   return coinTotal;
    // });

    // const tickerData = await Promise.all(tickerProcess);
    let response;
    let totalBalance = 0;
    let coinsData;
    // console.log(data);

    if (wallet) {
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
          response = {
            wallet_id: wallet._id,
            name: wallet.name,
            deposit: parseFloat(wallet.deposit),
            balance: parseFloat(wallet.balance),
            storeBalance: parseFloat(wallet.storeBalance),
            coins: coinsData,
            totalBalance: totalBalance,
            PNL: pnl,
            createTime: wallet.createTime,
          };
        } else {
          response = {
            error: true,
            message: "404 not found",
          };
        }
      } else {
        totalBalance = totalBalance + parseFloat(wallet.balance);
        pnl = (totalBalance / parseFloat(wallet.deposit)) * 100 - 100;
        response = {
          wallet_id: wallet._id,
          name: wallet.name,
          deposit: parseFloat(wallet.deposit),
          balance: parseFloat(wallet.balance),
          storeBalance: parseFloat(wallet.storeBalance),
          coins: null,
          totalBalance: parseFloat(wallet.balance),
          PNL: pnl,
          createTime: wallet.createTime,
        };
      }
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

const AllWallet = async (req, res) => {
  try {
    // const { id } = req.body
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    const wallets = await Wallet.find();

    // const tickerProcess = wallet.coins.map(async (coin) => {
    //   const coinTotal = await exchange.fetchTicker(coin.name + "/USDT");
    //   return coinTotal;
    // });

    // const tickerData = await Promise.all(tickerProcess);
    let response;
    // console.log(data);

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

      response = allWalletDetails;
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

const getAllWalletDetails = async (req, res) => {
  try {
    // const { id } = req.body
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    const wallets = await Wallet.find({ user_id: _id.id });

    // const tickerProcess = wallet.coins.map(async (coin) => {
    //   const coinTotal = await exchange.fetchTicker(coin.name + "/USDT");
    //   return coinTotal;
    // });

    // const tickerData = await Promise.all(tickerProcess);
    let response;
    // console.log(data);

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

      response = allWalletDetails;
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

const updateWalletById = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);

    const wallet_id = req.params.id;
    const data = req.body;
    // console.log(data)
    const wallet = await Wallet.findOneAndUpdate(
      { user_id: _id.id, _id: wallet_id },
      data
    );
    if (wallet) {
      res.json(wallet);
    } else {
      res.json({
        error: true,
        message: "404 not found",
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

const deleteWalletById = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ id }
    const _id = req.decoded;
    // console.log("Localfrom wallet", _id);
    const wallet_id = req.params.id;
    const wallet = await Wallet.findOneAndDelete({
      user_id: _id.id,
      _id: wallet_id,
    });

    if (wallet) {
      const order = await Order.deleteMany({
        wallet_id: wallet_id,
      });
      
      console.log(order);
      res.json(wallet);
    } else {
      res.json({
        error: true,
        message: "404 not found",
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

module.exports = {
  createWallet,
  getAllWallet,
  getWalletById,
  getAllWalletDetails,
  getWalletDetailsById,
  AllWallet,
  updateWalletById,
  deleteWalletById,
};
