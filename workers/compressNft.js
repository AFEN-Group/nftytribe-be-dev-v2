const Uploads = require("@functions/uploads");
const { redis } = require("@helpers/redis");
const { parentPort } = require("worker_threads");
const { default: axios } = require("axios");

parentPort.on("message", async ({ file }) => {
  const fileBuffer = await axios({
    url: file.replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/"),
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(fileBuffer.data, "binary");
  const [compressed] = await new Uploads().compressImages([buffer], 50, 500);
  await redis.setex(file, 2.628e6, compressed.toString("base64"));
});
