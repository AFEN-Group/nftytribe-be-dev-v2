const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const notifications = (sequelize, dataTypes) => {
  const notifications = sequelize.define("notifications", {
    type: {
      type: dataTypes.STRING(50),
      allowNull: false,
    },
    text: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    data: {
      type: dataTypes.JSON,
      allowNull: true,
    },
  });

  notifications.associate = (model) => {
    notifications.belongsTo(model.users, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };

  return notifications;
};

module.exports = notifications;
