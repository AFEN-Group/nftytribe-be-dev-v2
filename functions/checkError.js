const checkError = async (req, validationResult, getResult = {}) => {
  const { matchedData, locations } = getResult;
  const errors = validationResult(req);
  if (!errors.isEmpty())
    throw {
      error: errors.array({ stripUnknown: true }),
      status: 400,
    };

  if (matchedData && locations) {
    const data = matchedData(req, { locations });
    return data;
  }
};

module.exports = checkError;
