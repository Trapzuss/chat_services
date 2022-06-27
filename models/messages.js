const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  messageText: {
    type: String,
    required: true,
  },
  messageType: {
    default: "DEFAULT_MESSAGE",
    enum: [
      "DEFAULT_MESSAGE",
      "CONFIRM_ADOPT",
      "REQUEST_ADOPT",
      "CANCEL_REQUEST_ADOPT",
      "REJECT_ADOPT",
    ],
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const message = mongoose.model("message", messageSchema);
module.exports = message;
