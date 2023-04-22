const {
  createDeliveryChannels,
  getMethods,
  deleteDeliveryChannel,
  getMethodsData,
  getFee,
} = require("../../controllers/deliveryChannels");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  createDeliveryChannelsValidations,
  deleteDeliveryChannelsValidations,
  getStatesOrCitiesValidations,
  deliveryFeeValidation,
} = require("./validation");
const deliveryChannels = require("express").Router();

deliveryChannels
  .route("/methods/:methodName/:type")
  .get(getStatesOrCitiesValidations, getMethodsData);

deliveryChannels
  .route("/")
  .post(createDeliveryChannelsValidations, createDeliveryChannels)
  .get(getMethods);
deliveryChannels
  .route("/:id")
  .delete(deleteDeliveryChannelsValidations, deleteDeliveryChannel);

deliveryChannels
  .route("/get-fee/:methodName/:listingId")
  .post(userProtect, deliveryFeeValidation, getFee);

module.exports = deliveryChannels;
