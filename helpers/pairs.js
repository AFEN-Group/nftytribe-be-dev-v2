const Binance = require("node-binance-api");

const apiKey = process.env.binance_api_key;
const apiSecret = process.env.binance_api_secret_key;

const getPair = async (pair = "USDTNGN") => {
  const binance = new Binance().options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    family: 6,
  });

  try {
    return await new Promise((resolve, reject) => {
      binance.prices(pair, (error, ticker) => {
        if (error) {
          reject(error);
        } else {
          resolve(ticker);
        }
      });
    });
  } catch (err) {
    console.log(err.body);
  }
};
module.exports = getPair;
