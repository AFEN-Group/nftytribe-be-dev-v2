const errorHandler = (error, req, res, next) => {
  console.log(error);
  res.status(error.code || error.status || 500).send(error);
};

module.exports = errorHandler;
