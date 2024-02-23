const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linetoken: { type: String, required: false },
  imgurl: { type: String, required: true },
});

const User = mongoose.model("users", userSchema, "users");

module.exports = User;
