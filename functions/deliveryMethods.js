const topshipApi =
  process.env.NODE_ENV !== "production"
    ? process.env.topship_api_staging
    : process.env.topship_api_live;

const { default: Axios } = require("axios");
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
      const data = await fetchTopShip({
        url: "/get-cities",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
  };
}

module.exports = DeliveryMethods;
