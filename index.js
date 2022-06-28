const express = require("express");
const mongoose = require("mongoose");
const mongoDB = "mongodb+srv://yuuki:wasd1234@cluster0.njdpm.mongodb.net/ipets";
const messageModel = require("./models/messages");
const chatsModel = require("./models/chats");
const postsModel = require("./models/posts");
const usersModel = require("./models/users");
const app = express();
const cors = require("cors");
const port = 4000;
const uuid = require("uuid");
const bodyParser = require("body-parser");
mongoose
  .connect(mongoDB, {})
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((error) => console.log(error));

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json);
app.use(cors());

app.get("/", (req, res) => {
  res.send("Chat services");
});

app.post("/", async (req, res) => {
  console.log(req.body);

  res.send("ok");
});

// io.on("connection", async (socket) => {
//   socket.on("chatId", (data) => {
//     console.log(`${socket.id} entering to the room: ${data.chatId}`);
//     socket.join(data.chatId);
//     io.to(data.chatId).emit("received", data.text);
//   });

//   socket.on("message", (data) => {
//     console.log(data);
//     socket.join(data.chatId);
//     io.to(data.chatId).emit("received", data.text);
//   });

//   socket.on("disconnecting", () => {
//     console.log(socket.rooms); // the Set contains at least the socket ID
//   });

//   socket.on("disconnect", () => {});
// });

io.on("connection", async (socket) => {
  console.log("Connected by", socket.id);
  // socket.on("join", (data) => {
  //   socket.emit("fromServer", "ok from server");
  // });

  socket.on("chatId", async (data) => {
    console.log(`Entering chatId ${data.chatId} : ByUserId ${data.byUserId}`);
    if (data?.chatId != null) {
      socket.join(data.chatId);
      let chat = await chatsModel.findOne({ _id: data.chatId }).exec();
      let toUserId = chat?.participants.map((userId) => {
        if (userId != data.byUserId) {
          return userId;
        }
      });

      let toUser = await usersModel.findOne({ _id: toUserId }, { password: 0 });
      let payload = {
        chat,
        toUser,
      };

      socket.to(data.chatId).emit("received-messages", payload);
      socket.emit("received-messages", payload);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });

  socket.on("createMessage", async (msg) => {
    // console.log(msg);
    const newMessage = {
      postId: msg.postId,
      chatId: msg.chatId,
      byUserId: msg.byUserId,
      toUserId: msg.toUserId,
      messageText: msg.messageText,
      messageType:
        msg.messageType == null ? "DEFAULT_MESSAGE" : msg.messageType,
    };
    // console.log(newMessage);
    let chat;
    if (newMessage.chatId == null) {
      let response = await chatsModel.create({
        postId: newMessage.postId,
        participants: [newMessage.byUserId, newMessage.toUserId],
        messages: [
          {
            userId: newMessage.byUserId,
            messageText: newMessage.messageText,
            messageType: newMessage.messageType,
          },
        ],
      });
      newMessage.chatId = response._id;
      // chat = await chatsModel.findOne({ _id: response._id });
    } else {
      await chatsModel.updateOne(
        {
          _id: newMessage.chatId,
        },
        {
          $push: {
            messages: {
              messageId: uuid.v4(),
              userId: newMessage.byUserId,
              messageText: newMessage.messageText,
              messageType: newMessage.messageType,
            },
          },
        }
      );
      // chat = await chatsModel.findOne({ _id: newMessage.chatId });
    }
    socket.join(newMessage.chatId);
    if (newMessage.messageType != "DEFAULT_MESSAGE") {
      let adoptStatusComputed = {
        REJECT_ADOPT: "IDLE",
        CANCEL_REQUEST_ADOPT: "IDLE",
        CONFIRM_ADOPT: "CONFIRMED",
        REQUEST_ADOPT: "REQUESTED",
        CANCEL_CONFIRM: "IDLE",
      };
      await chatsModel.updateOne(
        { _id: newMessage.chatId },
        { $set: { adoptStatus: adoptStatusComputed[newMessage.messageType] } }
      );
      // if confirm adopt
      if (newMessage.messageType == "CONFIRM_ADOPT") {
        await postsModel.updateOne(
          { _id: newMessage.postId },
          {
            $set: {
              adoptedAt: Date.now(),
              adoptedBy: newMessage.toUserId,
            },
          }
        );
      }
      // if reject adopt
      if (
        newMessage.messageType == "REJECT_ADOPT" ||
        newMessage.messageType == "CANCEL_CONFIRM"
      ) {
        await postsModel.updateOne(
          { _id: newMessage.postId },
          {
            $set: {
              adoptedAt: null,
              adoptedBy: null,
            },
          }
        );
      }
    }
    await chatsModel.updateOne(
      { _id: newMessage.chatId },
      {
        $set: {
          updatedAt: Date.now(),
        },
      }
    );

    let toUser = await usersModel.findOne(
      { _id: newMessage.toUserId },
      { password: 0 }
    );
    chat = await chatsModel.findOne({ _id: newMessage.chatId });
    let payload = {
      chat,
      toUser,
    };
    // console.log(payload);
    // io.emit("received-messages", payload);
    socket.to(newMessage.chatId).emit("received-messages", payload);
    socket.emit("received-messages", payload);
    // console.log("emit received-messages");
  });
});
