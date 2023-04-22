const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const addresses = (sequelize, dataTypes) => {
  const addresses = sequelize.define("addresses", {
    address_code: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
  });

  addresses.associate = (model) => {
    addresses.belongsTo(model.users);
  };

  return addresses;
};

module.exports = addresses;
