const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const shipments = (sequelize, dataTypes) => {
  const shipments = sequelize.define("shipments", {
    order: {
      type: dataTypes.JSON,
      allowNull: false,
    },
  });
  shipments.associate = (models) => {
    shipments.belongsTo(models.users, {
      as: "receiver",
    });
    shipments.belongsTo(models.users, {
      as: "sender",
    });
    // shipments.belongsTo(models.users, { onDelete: "cascade" });
  };
  return shipments;
};

module.exports = shipments;
