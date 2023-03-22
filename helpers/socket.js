const { createAdapter } = require("@socket.io/redis-adapter");
const { redis, subClient } = require("./redis");
const { Server: Socket } = require("socket.io");
const { Emitter } = require("@socket.io/redis-emitter");
const jwt = require("jsonwebtoken");

exports.socketEmitter = new Emitter(redis);

exports.startSocket = (server) => {
  const io = new Socket(server, {
    transports: ["websocket"],
    adapter: createAdapter(redis, subClient),
  });

  io.use(authentication);
  io.on("connect", async (socket) => {
    const { user } = socket;
    socket.join(`${user.id}`);

    //emits activities of this connection
    socket.emit("info", "joined room");

    socket.on("disconnect", (e) => {
      //do nothing on disconnection
    });
  });
};

//middlewares

const authentication = async (socket, next) => {
  try {
    //authenticate
    const authorization =
      socket.handshake.headers.authorization ?? socket.handshake.auth?.token;

    // console.log(authorization);
    const user = jwt.verify(authorization, process.env.jwt_key);
    if (!user) next(new Error("Invalid user"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error(JSON.stringify(err)));
  }
};

// let num = 1;
// setInterval(() => {
//   this.socketEmitter.to("4").emit("info", { data: "lol" });
//   num++;
// }, 2000);
