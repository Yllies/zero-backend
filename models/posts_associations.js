const mongoose = require("mongoose");

const postsAssociationsSchema = mongoose.Schema({
  idPost: String, 
  title: String,
  description: String,
  category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  creation_date: Date,
});

const PostAssociation = mongoose.model(
  "posts_associations",
  postsAssociationsSchema
);

module.exports = PostAssociation;
