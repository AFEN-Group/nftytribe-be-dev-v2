const { query } = require("express-validator");

exports.SearchValidations = [
  query("limit").default(10).toInt(),
  query("page").default(1).toInt(),
  query("searchQuery").notEmpty(),
];
