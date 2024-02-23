const ccxt = require("ccxt");
const Order = require("../models/order");
const Transaction = require("../models/transaction");
const {
  limitBuy,
  limitSell,
  doBuy,
  doSell,
  CancelLimitBuy,
  CancelLimitSell,
} = require("../libs/wallet");
const { openOrder } = require("../libs/trade");

const getOrder = async (req, res) => {
  let response;
  try {
    const wallet_id = req.params.id;
    const _id = req.decoded;

    let order = await Order.find({ user_id: _id.id, wallet_id: wallet_id });
    if (order) {
      response = order;
    } else {
      response = {
        error: true,
        message: "Authorization failed",
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

const getPendingOrder = async (req, res) => {
  let response;
  try {
    const wallet_id = req.params.id;
    const _id = req.decoded;

    let order = await Order.find({
      user_id: _id.id,
      wallet_id: wallet_id,
      status: "Pending",
    });

    if (order) {
      response = order;
    } else {
      response = {
        error: true,
        message: "Authorization failed",
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

const getOpenOrder = async (req, res) => {
  let response;
  try {
    const wallet_id = req.params.id;
    const _id = req.decoded;

    let order = await Order.find({
      user_id: _id.id,
      wallet_id: wallet_id,
      side: "buy",
      status: "Filled",
    });

    if (order) {
      response = order;
    } else {
      response = {
        error: true,
        message: "Authorization failed",
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

const marketOrder = async (req, res) => {
  let error = false;
  let response;
  try {
    const {
      wallet_id,
      pair,
      type,
      side,
      amount,
      avgPrice,
      fee,
      total,
      takeProfit,
      stopLoss,
    } = req.body;
    const user_id = req.decoded.id;

    // console.log(req.body);

    if (
      !wallet_id ||
      !pair ||
      !type ||
      !side ||
      !amount ||
      !avgPrice ||
      !fee ||
      !total
    ) {
      error = true;
      response = {
        error: true,
        message: "Please check amount",
      };
    } else {
      let result;
      if (side === "buy") {
        result = await doBuy(
          user_id,
          wallet_id,
          type,
          avgPrice,
          total,
          pair,
          amount,
          fee
        );
      }

      if (side === "sell") {
        result = await doSell(
          user_id,
          wallet_id,
          type,
          avgPrice,
          total,
          pair,
          amount,
          fee
        );
      }

      if (!error) {
        if (result.error) {
          response = result;
        } else {
          const order = await Order.create({
            pair,
            type,
            side,
            amount,
            avgPrice,
            fee,
            total,
            wallet_id,
            user_id,
            takeProfit,
            stopLoss,
            status: "Filled",
          });
          if (order) {
            response = order;
          } else {
            response = {
              error: true,
              message: "Cannot Create Order",
            };
          }
        }
      } else {
        // console.log("error3");
        response = {
          error: true,
          message: "Please try again",
        };
      }
    }
  } catch (e) {
    response = {
      error: true,
      message: "Something went wrong",
    };
    console.log(e);
  }

  res.send(response);
};

const limitOrder = async (req, res) => {
  let error = false;
  let response;
  try {
    const {
      wallet_id,
      pair,
      type,
      side,
      amount,
      avgPrice,
      currentPrice,
      fee,
      total,
      takeProfit,
      stopLoss,
    } = req.body;
    const user_id = req.decoded.id;

    // console.log(req.body);

    if (
      !wallet_id ||
      !pair ||
      !type ||
      !side ||
      !amount ||
      !avgPrice ||
      !fee ||
      !total
    ) {
      error = true;
      response = {
        error: true,
        message: "Please check amount",
      };
    }

    if (!error) {
      let result;
      if (side === "buy") {
        result = await limitBuy(user_id, wallet_id, total);
      }
      if (side === "sell") {
        result = await limitSell(user_id, wallet_id, pair, amount, fee);
      }
      if (result.error) {
        response = result;
      } else {
        const order = await Order.create({
          pair,
          type,
          side,
          amount,
          avgPrice,
          fee,
          total,
          wallet_id,
          user_id,
          takeProfit,
          stopLoss,
          status: "Pending",
        });

        if (order) {
          // console.log(resOrder);

          await Transaction.create({
            pair,
            type,
            side,
            amount,
            avgPrice,
            currentPrice,
            fee,
            total,
            order_id: order._id,
            status: "Pending",
          });

          response = order;
        } else {
          response = {
            error: true,
            message: "All input is required",
          };
        }
      }
    } else {
      // console.log("error3");
      response = {
        error: true,
        message: "Please try again",
      };
    }
  } catch (e) {
    response = {
      error: true,
      message: "Something went wrong",
    };
    console.log(e);
  }

  res.send(response);
};

const CancelOrder = async (req, res) => {
  let response;
  try {
    // const wallet = await Wallet.findOne({ id }
    const order_id = req.params.id;
    const { currentPrice } = req.body;

    const order = await Order.findOne({
      _id: order_id,
    });

    let result;

    if (order) {
      if (order.side === "buy") {
        result = await CancelLimitBuy(
          order.user_id,
          order.wallet_id,
          order.total
        );
      }
      if (order.side === "sell") {
        result = await CancelLimitSell(
          order.user_id,
          order.wallet_id,
          order.pair,
          order.amount,
          order.fee
        );
      }
      if (result.error) {
        response = result;
      } else {
        await Order.findOneAndUpdate(
          {
            _id: order_id,
          },
          { $set: { status: "Cancel", createTime: Date.now() } }
        );

        await Transaction.create({
          pair: order.pair,
          type: order.type,
          side: order.side,
          amount: order.amount,
          avgPrice: order.avgPrice,
          currentPrice,
          fee: order.fee,
          total: order.total,
          order_id: order._id,
          status: "Cancel",
        });

        // await Order.create({
        //   _id: order._id,
        //   pair: order.pair,
        //   type: order.type,
        //   side: order.side,
        //   amount: order.amount,
        //   avgPrice: order.avgPrice,
        //   fee: order.fee,
        //   total: order.total,
        //   status: "Cancel",
        //   wallet_id: order.wallet_id,
        //   user_id: order.user_id,
        // });

        // console.log(order);
        // await Order.create(order);
        response = order;
      }
    } else {
      response = {
        error: true,
        message: "404 not found",
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
  getOrder,
  getPendingOrder,
  getOpenOrder,
  limitOrder,
  marketOrder,
  CancelOrder,
};
