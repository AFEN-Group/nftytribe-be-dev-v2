const { createUserValidation } = require("./validations");

const user = require("express").Router();

user.route("/").get(createUserValidation);

module.exports = user;
