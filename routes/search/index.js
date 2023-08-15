const { generalSearch } = require("@controllers/search");
const search = require("express").Router();
const { SearchValidations } = require("./validations");

search.route("/").get(SearchValidations, generalSearch);

module.exports = search;
