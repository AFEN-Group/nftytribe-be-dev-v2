const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const admins = (sequelize, dataTypes) => {
  const admins = sequelize.define("admins", {
    email: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });

  return admins;
};

module.exports = admins;
