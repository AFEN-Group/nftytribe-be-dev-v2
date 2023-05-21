const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const supportedTokens = (sequelize, dataTypes) => {
  const supportedTokens = sequelize.define("supportedTokens", {
    token: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });
  supportedTokens.associate = (models) => {
    supportedTokens.belongsTo(models.chains);
  };
  return supportedTokens;
};

module.exports = supportedTokens;
