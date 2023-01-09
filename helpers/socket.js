const { createAdapter } = require("@socket.io/redis-adapter");
const { redis, subClient } = require("./redis");
const { Server: Socket } = require("socket.io");
const { Emitter } = require("@socket.io/redis-emitter");

exports.socketEmitter = new Emitter(redis);

exports.startSocket = (server) => {
  const io = new Socket(server, {
    transports: ["websocket"],
    adapter: createAdapter(redis, subClient),
  });

  io.on("connect", (socket) => {
    //authenticate
  });
};
