const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  // UserModel user;
  // String lastMessage;
  // String lastTime;
  // bool isContinue;
  user: {
    type: Object,
    required: true,
  },
  lastMessage: {
    type: String,
    required: true,
  },
  lastTime: {
    type: String,
    required: true,
  },
  isContinue: {
    type: Boolean,
    required: true,
  },
});

const message = mongoose.model("message", messageSchema);
module.exports = message;
