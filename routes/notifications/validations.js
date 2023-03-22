const { query } = require("express-validator");

exports.getNotificationValidations = [
  query("limit").default(10).toInt(),
  query("page").default(1).toInt(),
];
