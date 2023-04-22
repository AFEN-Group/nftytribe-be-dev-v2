const { default: Axios } = require("axios");
const { body } = require("express-validator");
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
}

class BubbleValidations {
  static verifyAddress = [
    body(["name", "email", "phone", "address"]),
    body("email").isEmail().normalizeEmail(),
  ];
}
