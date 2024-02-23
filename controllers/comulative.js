const ccxt = require("ccxt");
const exchange = new ccxt.binance();
const Comulative = require("../models/comulative");
const mongoose = require("mongoose");
const Wallet = require("../models/wallet");

const getComulativeWallet = async () => {
  let result;
  try {
    const market = await exchange.fetchTickers();
    let marketKeys = Object.keys(market);
    let marketValues = Object.values(market);
    const wallets = await Wallet.find();
    let allWallet = [];

    if (wallets) {
      allWallet = wallets.map((wallet) => {
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
              deposit: parseFloat(wallet.deposit),
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
            deposit: parseFloat(wallet.deposit),
            totalBalance: parseFloat(wallet.balance),
            PNL: pnl,
            createTime: wallet.createTime,
          });
        }
      });

      result = allWallet;
    } else {
      response = {
        error: true,
        message: "Please Create Wallet",
      };
    }

    return result;
    // res.json(result)
  } catch (e) {
    result = {
      error: true,
      message: e.message,
    };
    return result;
    // res.json(result)
  }
};

const recordComulativeWallet = async (req, res) => {
  let response;
  try {
    const data = await getComulativeWallet();
    let allResult = data.map(async (index) => {
      let profit_loss = index.totalBalance - index.deposit;
      const findCollection = await Comulative.find({
        wallet_id: index.wallet_id,
      });

      if (findCollection != 0) {
        updateResult = await Comulative.findOneAndUpdate(
          {
            wallet_id: index.wallet_id,
          },
          {
            $push: {
              pnl: {
                day: new Date(),
                totalBalance: index.totalBalance,
                dailyPNL: index.PNL,
                profit_loss: profit_loss,
              },
            },
          }
        );
        if (updateResult) {
          return updateResult;
        } else {
          response = {
            error: true,
            message: "Cannot update wallet",
          };
        }
      } else {
        const createResult = await Comulative.create({
          wallet_id: index.wallet_id,
          user_id: index.user_id,
          firstDeposit: index.deposit,
          createTime: index.createTime,
        });

        if (createResult) {
          updateResult = await Comulative.findOneAndUpdate(
            {
              wallet_id: index.wallet_id,
            },
            {
              $push: {
                pnl: {
                  day: new Date(),
                  totalBalance: index.totalBalance,
                  dailyPNL: index.PNL,
                  profit_loss: profit_loss,
                },
              },
            }
          );
          if (updateResult) {
            return updateResult;
          } else {
            response = {
              error: true,
              message: "Cannot update last create comulative",
            };
          }
        }
      }
    });

    response = allResult;
    // res.json(response);
    return response;
  } catch (e) {
    response = {
      error: true,
      message: e.message,
    };
    return response;
    // res.json(response);
  }
};

const fetchComulativesWalletById = async (req, res) => {
  try {
    let response;

    const wallet_id = req.params.id;

    const findCollection = await Comulative.findOne({ wallet_id: wallet_id });

    if (findCollection != 0) {
      response = findCollection;
    } else {
      response = {
        error: true,
        message: "Data not found",
      };
    }

    res.json(response);
  } catch (e) {
    res.json({
      error: "true",
      message: e.message,
    });
    console.log(e);
  }
};

module.exports = {
  getComulativeWallet,
  // createComulativeWallet,
  recordComulativeWallet,
  fetchComulativesWalletById,
};
