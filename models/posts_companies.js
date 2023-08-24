const mongoose = require("mongoose");

const postsCompaniesSchema = mongoose.Schema({
  idPost: String,
  title: String,
  description: String,
  category: String,
  photo: [String],
  quantity: Number,
  availability_date: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  creation_date: Date,
  isBookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  isBooked: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});
postsCompaniesSchema.index({ location: "2dsphere" });

const PostCompany = mongoose.model("posts_companies", postsCompaniesSchema);

module.exports = PostCompany;
