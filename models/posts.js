const mongoose = require("mongoose");
const uuid = require("uuid");

const PostsSchema = new mongoose.Schema({
  userId: String,

  petName: String,

  images: String,

  address: {
    type: {
      _id: String,
      district: String,
      province: String,
      country: String,
    },
  },

  description: String,

  sex: String,

  age: {
    year: String,
    month: String,
  },

  weight: String,

  price: Number,

  adoptedBy: String,

  updatedAt: {
    type: Date,
    default: Date.now(),
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  adoptedAt: Date,
});

const Posts = mongoose.model("posts", PostsSchema);
module.exports = Posts;
