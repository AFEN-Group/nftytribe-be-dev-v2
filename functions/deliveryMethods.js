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
    getDeliveryFee: async function (listingId, senderDetails = {}) {
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
      const addedPercentage =
        result.cost * (Number(process.env.delivery_percentage) / 100) +
        result.cost;
      return { ...result, cost: addedPercentage };
    },
  };
}

module.exports = DeliveryMethods;
