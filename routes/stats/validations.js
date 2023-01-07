const { query } = require("express-validator");
const moment = require("moment");
exports.collectionStatsValidations = [
  // query(["startDate", "endDate"]).isDate(),
  query("startDate").toDate().default(moment().format("YYYY-MM-DD")),
  query("endDate")
    .toDate()
    .default(moment().add(7, "days").format("YYYY-MM-DD")),
  query(["limit", "page"]).toInt(),
  query("page").default(1),
  query("limit").default(7),
];

// console.log(moment().add(7, "days").toDate());
// console.log(new Date().toISOString());
