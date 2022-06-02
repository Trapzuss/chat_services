const express = require("express");
const mongoose = require("mongoose");
const mongoDB = "mongodb+srv://yuuki:wasd1234@cluster0.njdpm.mongodb.net/ipets";
const messageModel = require("./models/messages");
const app = express();
const cors = require("cors");
const port = 4000;

mongoose
  .connect(mongoDB, {})
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json);
app.use(cors());
var client = {};
io.on("connection", (socket) => {
  console.log("Connected by", socket.id);

  // socket.on("sign-in", (id) => {

  //   client[id] = socket;
  //   console.log(client);
  // });

  messageModel.find().then((res) => {
    socket.emit("received-messages", res);
  });

  socket.on("join", (data) => {
    // console.log(data);
    socket.emit("fromServer", "ok from server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });

  socket.on("createMessage", (message) => {
    const newMessage = new messageModel({
      user: message.user,
      lastMessage: message.lastMessage,
      lastTime: message.lastTime,
      isContinue: message.isContinue,
    });
    newMessage.save().then(() => {
      messageModel.find().then((res) => {
        socket.emit("received-messages", res);
      });
    });
    // console.log(message);
  });
});
