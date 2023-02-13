const topshipApi =
  process.env.NODE_ENV !== "production"
    ? process.env.topship_api_staging
    : process.env.topship_api_live;

const { default: Axios } = require("axios");
const db = require("../models");
const fetchTopShip = Axios.create({
  baseURL: topshipApi,
  headers: {
    Authorization: `Bearer ${process.env.topship_api_key}`,
  },
});

class DeliveryMethods {
  constructor(data = {}) {
    this.userData = data;
  }

  static topship = {
    getCountries: async () => {
      const data = await fetchTopShip({
        url: "/get-countries",
      });
      return data.data;
    },
    getStates: async (countryCode = "NG") => {
      const data = await fetchTopShip({
        url: "/get-states",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
    getCities: async (countryCode = "NG") => {
      console.log(topshipApi);
      const data = await fetchTopShip({
        url: "/get-cities",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
    getDeliveryFee: async function (
      listingId,
      senderDetails = {},
      noFee = false
    ) {
      const item = await db.physicalItems.findOne({
        where: {
          nftId: listingId,
        },
      });

      const data = await fetchTopShip({
        url: "/get-shipment-rate",
        params: {
          shipmentDetail: JSON.stringify({
            senderDetails: {
              cityName: senderDetails.city,
              countryCode: senderDetails.countryCode,
            },
            receiverDetails: {
              cityName: item.city,
              countryCode: item.country,
            },
            totalWeight: Number(item.weight),
          }),
        },
      });
      const result = data.data[0];
      const addedPercentage = !noFee
        ? result.cost * (Number(process.env.delivery_percentage) / 100) +
          result.cost
        : result.cost;
      return { ...result, cost: addedPercentage };
    },
    book: async (buyer) => {
      //fix - category(Others)
      //fix - description(any)
      //fix - quantity(1)
      //fix - value(convert nft price to get this value)
      //fix - pricingTier(Express)
      //fix - itemCollectionMode(DropOff)
      //fix - insuranceType(None)
      //fix - shipmentCharge(Express) -- > make a fresh request for the actual charge with no fee set to true
      //fix - sellers phone number --> seller must have gone through verification so phone number must be available
      //fix - address --> seller must have gone through verification so we'd have his address
    },
  };
}

module.exports = DeliveryMethods;
