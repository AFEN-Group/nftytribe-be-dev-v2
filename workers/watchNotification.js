//new nft listings to favorites
const { logger } = require("@helpers/logger");
const db = require("@models");
const { parentPort } = require("worker_threads");

parentPort.on("message", async ({ type, socket, extraData, listingId }) => {
  try {
    await db.notifications.generateWatchedNotifications(
      type,
      listingId,
      extraData,
      socket
    );
    return true;
  } catch (err) {
    logger(JSON.stringify(err), "listing-notification", "error");
    console.log(err);
  }
});
