const topshipApi =
  process.env.NODE_ENV !== "production"
    ? process.env.topship_api_staging
    : process.env.topship_api_live;

const { default: Axios } = require("axios");
const fetch = Axios.create({
  baseURL: topshipApi,
});

class DeliveryMethods {
  constructor(data = {}) {
    this.userData = data;
  }

  static topship = {
    getCountries: async () => {
      const data = await fetch({
        url: "/get-countries",
      });
      return data.data;
    },
    getStates: async (countryCode = "NG") => {
      const data = await fetch({
        url: "/get-states",
        params: {
          countryCode,
        },
      });
      return data.data;
    },
    getCities: async (countryCode = "NG") => {
      const data = await fetch({
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
// console.log(topshipApi);
// DeliveryMethods.topship.getCities().then(console.log.bind(this));
