// import db from "";
const db = require("@models");
const expressAsyncHandler = require("express-async-handler");

exports.getRecentAnnouncement = expressAsyncHandler(async (req, res) => {
  const recent = await db.announcements.findAll({
    limit: 5,
    order: [["id", "desc"]],
  });

  res.send(recent);
});
