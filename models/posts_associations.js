const mongoose = require("mongoose");

const postsAssociationsSchema = mongoose.Schema({
  title: String,
  description: String,
  category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  //   posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
  creation_date: Date,
});

const PostAssociation = mongoose.model(
  "posts_associations",
  postsAssociationsSchema
);

module.exports = PostAssociation;
