const { body, param } = require("express-validator");
const db = require("../../models");

exports.createDeliveryChannelsValidations = [body("name").not().isEmpty()];

exports.deleteDeliveryChannelsValidations = [
  param("id").custom(async (id, { req }) => {
    data = await db.deliveryChannels.findOne({
      where: {
        id,
      },
    });
    if (!data) throw "delivery method does not exist!";
    req.deliveryMethod = data;
    return true;
  }),
];
