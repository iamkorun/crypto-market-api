const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const FavSchema = new mongoose.Schema({
    user_id: { type: ObjectId, required: true },
    coins: { type: Array, default: [] },
});

const Fav = mongoose.model("favcoins", FavSchema, "favcoins");

module.exports = Fav;
