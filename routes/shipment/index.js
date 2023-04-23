const { verifyAddress, retrieveRates, book } = require("@controllers/shipment");
const { BubbleValidations, BubbleDelivery } = require("@helpers/bubble");
const userProtect = require("@middlewares/userProtect.middleware");
const { param } = require("express-validator");

const shipment = require("express").Router();

shipment
  .route("/verify-address")
  .post(userProtect, BubbleValidations.verifyAddress, verifyAddress);

shipment.get("/categories", async (req, res) => {
  res.send(await BubbleDelivery.getCategories());
});
shipment.get("/box-sizes", async (req, res) => {
  res.send(await BubbleDelivery.boxSizes());
});

shipment.get(
  "/:listingId/rates",
  userProtect,
  [param("listingId").notEmpty()],
  retrieveRates
);

shipment.post("/book/:listingId", userProtect, BubbleValidations.booking, book);

module.exports = shipment;
