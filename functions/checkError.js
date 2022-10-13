const checkError = async (req, validationResult) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw {
      error: errors.array({ stripUnknown: true }),
      status: 400,
    };
};

module.exports = checkError;
