const userProtect = require("@middlewares/userProtect.middleware");
const { getNotificationValidations } = require("./validations");
const { getNotification, markAll } = require("@controllers/notifications");

const notification = require("express").Router();

notification
  .route("/")
  .get(userProtect, getNotificationValidations, getNotification)
  .patch(userProtect, markAll);

module.exports = notification;
