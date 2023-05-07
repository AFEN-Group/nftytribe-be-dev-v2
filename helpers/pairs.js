// const Binance = require("node-binance-api");
const { default: axios } = require("axios");
const apiKey = process.env.binance_api_key;
const apiSecret = process.env.binance_api_secret_key;

const getPair = async () => {
  const { data } = await axios({
    url: "http://64.227.144.246:4000/ngn",
  });
  return data;
};
module.exports = getPair;
