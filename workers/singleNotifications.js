//new nft listings to favorites
const { logger } = require("@helpers/logger");
const db = require("@models");
const { parentPort } = require("worker_threads");

parentPort.on("message", async (data) => {
  try {
    const result = await db.notifications.generateSingleNotification(data);
    return result;
  } catch (err) {
    logger(JSON.stringify(err), "single-listing-notification", "error");
    console.log(err);
  }
});
