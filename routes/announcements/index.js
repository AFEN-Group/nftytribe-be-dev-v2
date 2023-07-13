const { getRecentAnnouncement } = require("@controllers/announcements");

const announcements = require("express").Router();

announcements.get("/", getRecentAnnouncement);

module.exports = announcements;
