const { body, param, query } = require("express-validator");
const db = require("../../models");

exports.createDeliveryChannelsValidations = [body("name").not().isEmpty()];

exports.deleteDeliveryChannelsValidations = [
  param("id").custom(async (id, { req }) => {
    data = await db.deliveryChannels.findOne({
      where: {
        id,
      },
    });
    if (!data) throw "Delivery method does not exist!";
    req.deliveryMethod = data;
    return true;
  }),
];

exports.getStatesOrCitiesValidations = [
  param("methodName").custom(async (name, { req }) => {
    const method = await db.deliveryChannels.findOne({
      where: {
        name,
      },
    });
    if (!method) throw "Delivery method does not exist";
    return true;
  }),
  param("type").not().isEmpty(),
  query("countryCode").isISO31661Alpha2(),
];
