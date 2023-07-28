const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  nickname: String,
  name: String,
  latitude: Number,
  longitude: Number,
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
