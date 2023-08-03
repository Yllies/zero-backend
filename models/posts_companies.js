const mongoose = require("mongoose");

const postsCompaniesSchema = mongoose.Schema({
  title: String,
  photo: String,
  description: String,
  category: String,
  quantity: Number,
  availability_date: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  creation_date: Date,
});

const PostCompany = mongoose.model("posts_companies", postsCompaniesSchema);

module.exports = PostCompany;
