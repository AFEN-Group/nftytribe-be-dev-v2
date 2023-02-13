const { request } = require("express");
const { validationResult, matchedData } = require("express-validator");

/**
 * @typedef {Object} GetResult
 * @property {typeof matchedData} matchedData - express validator matched data
 * @property {Array} locations - express locations eg. params | query | body
 */
/**
 *
 * @param {request} req - express request object
 * @param {typeof validationResult} validationResult - express validation result
 * @param {GetResult} getResult
 * @returns
 */
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
