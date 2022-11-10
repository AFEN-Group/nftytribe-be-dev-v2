const { Op } = require("sequelize");
const db = require("../models");
class Chains {
  getChains = async () => {
    return await db.chains.findAll();
  };

  createOrUpdateChain = async (data) => {
    const chain = await db.chains.upsert(data, {
      where: {
        [Op.or]: [{ name: data.name }, { chain: data.chain }],
      },
    });
    return chain;
  };

  removeChain = async (id) => {
    await db.chains.destroy({
      where: {
        id,
      },
    });
    return true;
  };
}

module.exports = Chains;
