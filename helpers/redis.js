const Redis = require("ioredis");
const { logger } = require("./logger");

try {
  exports.redis = new Redis({ host: process.env.redis });
  exports.subClient = this.redis.duplicate();
} catch (err) {
  console.log(err);
  process.exit(1);
}
logger("hello");
