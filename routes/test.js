const test = require("express").Router();
const db = require("@models");
const NotificationTypes = require("@types/notificationTypes");
const { Worker } = require("worker_threads");

test.get("/listing-notification", async (req, res) => {
  //   const worker = new Worker("./workers/watchNotification.js");
  //   worker.postMessage({
  //     type: NotificationTypes.BID_PLACED_WATCH,
  //     listingId: 43,
  //     socket: undefined,
  //   });
  //   worker.on("message", (data) => {
  //     console.log(data);
  //   });
  //   const data = await db.notifications.getNotifications({
  //     limit: 10,
  //     userId: 2,
  //     page: 1,
  //   });
  //   res.send(data);
});

module.exports = test;
