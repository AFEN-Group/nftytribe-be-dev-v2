const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const networks = (sequelize, dataTypes) => {
  const networks = sequelize.define("networks", {
    chain: {
      type: dataTypes.STRING(32),
      allowNull: false,
      primaryKey: true,
    },
    rpc: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  //   networks.sayHello = (stuff) => console.log(stuff);

  return networks;
};

module.exports = networks;
