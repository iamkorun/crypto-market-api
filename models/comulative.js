const mongoose = require("mongoose");

const Decimal = mongoose.Schema.Types.Decimal128;
const ObjectId = mongoose.Schema.Types.ObjectId;

const comulativeSchema = new mongoose.Schema({
  wallet_id: { type: ObjectId, required: true },
  user_id: { type: ObjectId, required: true },
  firstDeposit: { type: Decimal, required: true },
  createTime: { type: Date },
  pnl: { type: Array, default: [] },
});

const Comulative = mongoose.model(
  "comulative",
  comulativeSchema,
  "comulatives"
);

module.exports = Comulative;
