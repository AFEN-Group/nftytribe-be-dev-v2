const { default: Axios } = require("axios");
const { body, param } = require("express-validator");
const axios = Axios.create({
  baseURL: "https://api.shipbubble.com/v1/",
  headers: {
    Authorization: `Bearer ${process.env.ship_bubble}`,
  },
});
class BubbleDelivery {
  static verifyAddress = async (data) => {
    const { data: res } = await axios({
      url: "/shipping/address/validate/",
      method: "post",
      data,
    });
    return res;
  };

  static getCategories = async () => {
    const { data } = await axios({
      method: "get",
      url: "/shipping/labels/categories",
    });
    return data;
  };

  static boxSizes = async () => {
    const { data } = await axios({
      url: "/shipping/labels/boxes",
    });

    return data;
  };

  static requestShippingRates = async (data) => {
    const { data: res } = await axios({
      url: "/shipping/fetch_rates",
      method: "post",
      data,
    });
    return res;
  };

  static book = async (data) => {
    const { data: res } = await axios({
      method: "post",
      url: "/shipping/labels",
      data,
    });

    return res;
  };
}

class BubbleValidations {
  static verifyAddress = [
    body(["name", "phone", "address"]).trim().notEmpty(),
    // body("email").isEmail().normalizeEmail(),
  ];

  static booking = [
    body(["request_token", "service_code", "courier_id"]).trim().notEmpty(),
    param("listingId").notEmpty(),
  ];
}

module.exports = {
  BubbleDelivery,
  BubbleValidations,
};
