const db = require("@models");
const Web3 = require("web3");

const initWeb3 = async (chain) => {
  const { rpc } = await db.networks.findOne({
    where: {
      chain,
    },
  });
  const web3 = new Web3(rpc);
  return web3;
};

module.exports = initWeb3;
