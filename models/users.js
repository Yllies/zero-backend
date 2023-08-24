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
  phone_number: String,
  url_site: String,
  logo: String,
  longitude: Number,
  latitude:Number,
  longitudeDelta:Number,
  latitudeDelta:Number,
  token: String,
});

const User = mongoose.model("users", usersSchema);

module.exports = User;
