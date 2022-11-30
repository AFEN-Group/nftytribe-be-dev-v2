const Moralis = require("moralis").default;

Moralis.start({
  apiKey: process.env.moralis_api_key,
});

module.exports = Moralis;
