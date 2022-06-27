const mongoose = require("mongoose");
const uuid = require("uuid");
const { messageSchema } = require("./messages");

const UsersSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },

  address: {
    type: {
      _id: String,
      district: String,
      province: String,
      country: String,
    },
  },
  password: {
    type: String,
  },
  imageUrl: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Users = mongoose.model("users", UsersSchema);
module.exports = Users;
