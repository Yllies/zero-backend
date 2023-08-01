const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  email: String,
  password: String,
  username:String,
  name: String,
  address: String,
  siret_siren: Number,
  type: String,
  description: String,
  phone_number: Number,
  url_site: String,
  logo: String,
  token: String,
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
