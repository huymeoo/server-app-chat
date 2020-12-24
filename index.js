require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const usersRouter = require("./src/routers/usersRouter");
const routerAuth = require("./src/routers/authRouter");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./public"));

mongoose.connect(process.env.CONNECT_DATA, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on("connection", (client) => {
  console.log("ket noi " + client.id);

  client.on("data-chat", function (data) {
    // console.log(client.id + "chat:" + data);
    io.sockets.emit("data-chat-user", data);
  });
});

// io.use(async (socket, next) => {
//   if (socket.handshake.headers && socket.handshake.headers.authorization) {
//     const token = await jwt.verify(
//       socket.handshake.headers.authorization,
//       process.env.JWT_KEY
//     );

//     console.log(token);
//   } else {
//     next(new Error("Authentication error"));
//   }
// });

// io.sockets
//   .on(
//     "connection",
//     socketioJwt.authorize({
//       secret: process.env.JWT_KEY,
//       timeout: 15000, // 15 seconds to send the authentication message
//     })
//   )
//   .on("authenticated", (socket) => {
//     //this socket is authenticated, we are good to handle more events from it.
//     console.log(`hello! ${socket.decoded_token.name}`);
//   });

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.use("/auth", routerAuth);
app.use("/users", usersRouter);

mongoose.connection.on("connected", () => {
  console.log("Connected database !!!!!");
  server.listen(process.env.PORT, () => {
    console.log("Server is running");
  });
});
