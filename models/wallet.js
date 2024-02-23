const mongoose = require("mongoose");

const Decimal = mongoose.Schema.Types.Decimal128;
const ObjectId = mongoose.Schema.Types.ObjectId;

const walletSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deposit: { type: Decimal, required: true },
  balance: { type: Decimal, required: true },
  storeBalance: {type : Decimal, required:true},
  coins: { type: Array, default: null },
  storeCoins: { type: Array, default: null },
  user_id: { type: ObjectId, required: true },
  createTime: { type: Date, default: Date.now },
});

const Wallet = mongoose.model("wallet", walletSchema, "wallets");

module.exports = Wallet;
