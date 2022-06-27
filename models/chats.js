const mongoose = require("mongoose");
const uuid = require("uuid");
const { messageSchema } = require("./messages");

const ChatsSchema = new mongoose.Schema({
  //   chatId: {
  //     type: String,
  //     _id: true,
  //   },

  participants: {
    type: Array,
  },
  postId: {
    type: String,
    required: true,
  },
  messages: {
    type: [
      {
        messageId: { type: String, default: uuid.v4() },
        userId: String,
        messageText: String,
        messageType: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    required: true,
  },

  adoptStatus: {
    type: String,
    default: "IDLE",
  },

  updatedAt: {
    type: Date,
    default: Date.now(),
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Chats = mongoose.model("Chats", ChatsSchema);
module.exports = Chats;
