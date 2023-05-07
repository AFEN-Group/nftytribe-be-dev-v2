// const Binance = require("node-binance-api");
const { default: axios } = require("axios");

const getPair = async () => {
  const { data } = await axios({
    url: "http://64.227.144.246:4000/ngn",
  });
  return data;
};
module.exports = getPair;
