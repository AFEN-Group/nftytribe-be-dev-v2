const { createAdapter } = require("@socket.io/redis-adapter");
const { redis, subClient } = require("./redis");
const { Server: Socket } = require("socket.io");
const { Emitter } = require("@socket.io/redis-emitter");

exports.socketEmitter = new Emitter(redis);

// setInterval(() => {
//   this.socketEmitter.emit("time", new Date());
// }, 2000);

exports.startSocket = (server) => {
  const io = new Socket(server, {
    transports: ["websocket"],
    adapter: createAdapter(redis, subClient),
  });

  io.on("connect", (socket) => {
    socket.once("join-room", (room) => {
      console.log(`joining room ${room}`);
      socket.join(room);
    });
    socket.on("send-message", (message, room) => {
      this.socketEmitter.to(room).emit("new-message", message);
    });
  });
};
