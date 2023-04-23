const { validationResult, matchedData } = require("express-validator");

const checkError = async (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw {
      error: errors.array({ stripUnknown: true }),
      status: 400,
    };

  return matchedData(req);
};

module.exports = checkError;
