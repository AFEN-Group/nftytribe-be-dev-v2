const { logger } = require("../helpers/logger");

const errorHandler = (error, req, res, next) => {
  console.log(error);
  res.status(error.code || error.status || 500).send(error);
  logger({ url: req.originalUrl, error });
};

module.exports = errorHandler;
