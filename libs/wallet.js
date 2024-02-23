const Wallet = require("../models/wallet");
const { lineNotify } = require("./notify");

const limitBuy = async (user_id, wallet_id, total) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      user_id: user_id,
      _id: wallet_id,
    });
    // console.log(parseFloat(oldWallet.balance), "-", total);
    const newWallet = {
      storeBalance: oldWallet.storeBalance - total,
    };

    let updateWallet;
    if (parseFloat(oldWallet.storeBalance) >= total) {
      updateWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet_id,
          user_id: user_id,
        },
        newWallet
      );
    } else {
      error = true;
      result = {
        error: true,
        message: "Not enough balance",
      };
    }
    if (!error) {
      result = updateWallet;
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e,
    };
    return result;
  }
};

const CancelLimitBuy = async (user_id, wallet_id, total) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      user_id: user_id,
      _id: wallet_id,
    });
    // console.log(parseFloat(oldWallet.balance), "-", total);
    const newWallet = {
      storeBalance: parseFloat(oldWallet.storeBalance) + parseFloat(total),
    };

    let updateWallet;
    if (newWallet) {
      updateWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet_id,
          user_id: user_id,
        },
        newWallet
      );
    } else {
      error = true;
      result = {
        error: true,
        message: "404 not found",
      };
    }

    if (!error) {
      result = updateWallet;
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e.message,
    };

    return result;
  }
};

const limitSell = async (user_id, wallet_id, pair, amount, fee) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      _id: wallet_id,
      user_id: user_id,
    });
    // console.log(parseFloat(oldWallet.balance)+total);
    const findCoin = await oldWallet.storeCoins.find(({ name }) => {
      return name === pair.split("_")[0];
    });

    console.log(findCoin.amount, amount);
    const newWallet = {
      $set: { "storeCoins.$.amount": findCoin.amount - (amount - fee) },
    };

    let updateWallet;
    if (newWallet) {
      updateWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet_id,
          user_id: user_id,
          "storeCoins.name": pair.split("_")[0],
        },
        newWallet
      );
    } else {
      error = true;
      result = {
        error: true,
        message: "404 not found",
      };
    }

    if (!error) {
      result = updateWallet;
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e.message,
    };
    return result;
  }
};

const CancelLimitSell = async (user_id, wallet_id, pair, amount, fee) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      _id: wallet_id,
      user_id: user_id,
    });
    // console.log(parseFloat(oldWallet.balance)+total);
    const findCoin = await oldWallet.storeCoins.find(({ name }) => {
      return name === pair.split("_")[0];
    });
    // console.log(findCoin.amount , amount )
    const newWallet = {
      $set: {
        "storeCoins.$.amount":
          findCoin.amount + (parseFloat(amount) - parseFloat(fee)),
      },
    };

    let updateWallet;
    if (newWallet) {
      updateWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet_id,
          user_id: user_id,
          "storeCoins.name": pair.split("_")[0],
        },
        newWallet
      );
    }

    if (!error) {
      result = updateWallet;
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e,
    };
    return result;
  }
};

const doBuy = async (user_id, wallet_id, type, avgPrice, total, pair, amount, fee) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      user_id: user_id,
      _id: wallet_id,
    });

    const findCoin = oldWallet.coins.find(({ name }) => {
      return name === pair.split("_")[0];
    });

    const findStoreCoin = await oldWallet.storeCoins.find(({ name }) => {
      return name === pair.split("_")[0];
    });
    // console.log(parseFloat(oldWallet.balance), "-", total);
    if (findCoin) {
      const newWallet = {
        balance: oldWallet.balance - total,
        $set: { "coins.$.amount": findCoin.amount + (amount - fee) },
      };
      let newStore;
      if (type === "limit") {
        newStore = {
          $set: {
            "storeCoins.$.amount": findStoreCoin.amount + (amount - fee),
          },
        };
      } else {
        newStore = {
          storeBalance: oldWallet.storeBalance - total,
          $set: {
            "storeCoins.$.amount": findStoreCoin.amount + (amount - fee),
          },
        };
      }

      if (newWallet && newStore) {
        if (parseFloat(oldWallet.balance) >= total) {
          updateWallet = await Wallet.findOneAndUpdate(
            {
              _id: wallet_id,
              user_id: user_id,
              "coins.name": pair.split("_")[0],
            },
            newWallet
          );
          updateStore = await Wallet.findOneAndUpdate(
            {
              _id: wallet_id,
              user_id: user_id,
              "storeCoins.name": pair.split("_")[0],
            },
            newStore
          );
        } else {
          error = true;
          result = {
            error: true,
            message: "Not enough balance",
          };
        }
      } else {
        error = true;
        result = {
          error: true,
          message: "Cannot Update Wallet new data is null",
        };
      }
    } else {
      const newWallet = {
        balance: oldWallet.balance - total,
        $push: {
          coins: { name: pair.split("_")[0], amount: amount - fee },
        },
      };
      let newStore;
      if (type === "limit") {
        newStore = {
          $push: {
            storeCoins: { name: pair.split("_")[0], amount: amount - fee },
          },
        };
      } else {
        newStore = {
          storeBalance: oldWallet.storeBalance - total,
          $push: {
            storeCoins: { name: pair.split("_")[0], amount: amount - fee },
          },
        };
      }

      if (newWallet && newStore) {
        if (parseFloat(oldWallet.balance) >= total) {
          updateWallet = await Wallet.findOneAndUpdate(
            { _id: wallet_id, user_id: user_id },
            newWallet
          );
          updateStore = await Wallet.findOneAndUpdate(
            { _id: wallet_id, user_id: user_id },
            newStore
          );
        } else {
          // console.log("error2");
          error = true;
          result = {
            error: true,
            message: "Not enough balance",
          };
        }
      } else {
        error = true;
        result = {
          error: true,
          message: "Cannot Update Wallet new data is null",
        };
      }
    }
    if (!error) {
      result = updateWallet; 
      let side = "buy";
      lineNotify(user_id, oldWallet.name, pair, side, avgPrice, amount, total);
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e.message,
    };
    console.log(e);
    return result;
  }
};

const doSell = async (user_id, wallet_id, type, avgPrice, total, pair, amount, fee) => {
  let error = false;
  let result;
  try {
    const oldWallet = await Wallet.findOne({
      _id: wallet_id,
      user_id: user_id,
    });
    // console.log(parseFloat(oldWallet.balance)+total);
    const findCoin = await oldWallet.coins.find(({ name }) => {
      return name === pair.split("_")[0];
    });

    const findStoreCoin = await oldWallet.storeCoins.find(({ name }) => {
      return name === pair.split("_")[0];
    });
    // console.log(findCoin.amount , amount )
    if (findCoin.amount >= amount) {
      const newWallet = {
        balance: parseFloat(oldWallet.balance) + parseFloat(total),
        $set: { "coins.$.amount": findCoin.amount - (amount - fee) },
      };

      let newStore;
      if (type === "limit") {
        newStore = {
          storeBalance: parseFloat(oldWallet.storeBalance) + parseFloat(total),
        };
      } else {
        newStore = {
          storeBalance: parseFloat(oldWallet.storeBalance) + parseFloat(total),
          $set: {
            "storeCoins.$.amount": findStoreCoin.amount - (amount - fee),
          },
        };
      }

      if (newWallet && newStore) {
        updateWallet = await Wallet.findOneAndUpdate(
          {
            _id: wallet_id,
            user_id: user_id,
            "coins.name": pair.split("_")[0],
          },
          newWallet
        );
        updateStore = await Wallet.findOneAndUpdate(
          {
            _id: wallet_id,
            user_id: user_id,
            "storeCoins.name": pair.split("_")[0],
          },
          newStore
        );
      } else {
        error = true;
        result = {
          error: true,
          message: "Cannot Update Wallet new data is null",
        };
      }
    } else {
      // console.log("error");
      // console.log(findCoin.amount, amount);
      error = true;
      result = {
        error: true,
        message: "Cannot Update Wallet",
      };
    }
    if (!error) {
      result = updateWallet;
      let side = "sell";
      lineNotify(user_id, oldWallet.name, pair, side, avgPrice, amount, total);
    }
    return result;
  } catch (e) {
    result = {
      error: true,
      message: e.message,
    };
    console.log(e);
    return result;
  }
};

module.exports = {
  limitBuy,
  CancelLimitBuy,
  limitSell,
  CancelLimitSell,
  doBuy,
  doSell,
};
