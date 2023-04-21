const Redis = require("ioredis");

exports.redis = new Redis({ host: process.env.redis });
exports.subClient = this.redis.duplicate();

this.redis.on("connect", () => console.log("redis connected"));
// logger("hello");
