const Redis = require("ioredis");

exports.redis = new Redis({ host: process.env.redis });
exports.subClient = this.redis.duplicate();

// logger("hello");
