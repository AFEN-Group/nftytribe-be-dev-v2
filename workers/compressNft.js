const Uploads = require("@functions/uploads");
const { redis } = require("@helpers/redis");
const { parentPort } = require("worker_threads");

parentPort.on("message", async ({ buffer, file }) => {
  const [compressed] = await new Uploads().compressImages([buffer], 10);
  await redis.setex(file, 2.628e6, compressed);
});
