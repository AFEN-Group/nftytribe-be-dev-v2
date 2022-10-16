const Axios = require("axios");

const axios = Axios.create({
  baseURL: "https://deep-index.moralis.io/api/v2",
  headers: {
    "x-api-key": process.env.moralis_api_key,
  },
});

const moralis = async (url, method = "get", params = {}) => {
  const { data } = await axios({
    method,
    url,
    params,
  });

  return data;
};

module.exports = moralis;
