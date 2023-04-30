// const Binance = require("node-binance-api");
const { default: axios } = require("axios");
const apiKey = process.env.binance_api_key;
const apiSecret = process.env.binance_api_secret_key;

const getPair = async () => {
  const { data } = await axios({
    url: "https://7xy.se7entales.org/ngn",
  });
  return data;
};
module.exports = getPair;
