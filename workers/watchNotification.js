//new nft listings to favorites
const { logger } = require("@helpers/logger");
const db = require("@models");
const { parentPort } = require("worker_threads");

parentPort.on("message", async ({ type, socket, listingId }) => {
  try {
    await db.notifications.generateWatchedNotifications(
      type,
      listingId,
      socket
    );
    return true;
  } catch (err) {
    logger(JSON.stringify(err), "listing-notification", "error");
    console.log(err);
  }
});
