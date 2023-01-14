const Redis = require("ioredis");

try {
  exports.redis = new Redis({ host: process.env.redis });
  exports.subClient = this.redis.duplicate();
} catch (err) {
  console.log(err);
  process.exit(1);
}
// logger("hello");
