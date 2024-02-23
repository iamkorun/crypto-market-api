const mongoose = require("mongoose");

const Decimal = mongoose.Schema.Types.Decimal128;
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  type: { type: String, required: true },
  side: { type: String, required: true },
  amount: { type: Decimal, required: true },
  avgPrice: { type: Decimal, required: true },
  fee: { type: Decimal, required: true },
  total: { type: Decimal, required: true },
  takeProfit: { type: Decimal, dafault: null },
  stopLoss: { type: Decimal, default: null },
  status: { type: String, required: true },
  wallet_id: { type: ObjectId, required: true },
  user_id: { type: ObjectId, required: true },
  createTime: { type: Date, default: Date.now },
});

const Order = mongoose.model("order", orderSchema, "orders");

module.exports = Order;
