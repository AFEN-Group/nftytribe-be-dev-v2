//new nft listings to favorites
const { logger } = require("@helpers/logger");
const db = require("@models");
const { parentPort } = require("worker_threads");

parentPort.on("message", async (data) => {
  try {
    return await db.notifications.generateWatchedNotifications(data);
  } catch (err) {
    logger(JSON.stringify(err), "listing-notification", "error");
    console.log(err);
  }
});
