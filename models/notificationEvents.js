const notificationEvents = (sequelize, dataTypes) => {
  const notificationEvents = sequelize.define("notificationEvents", {
    name: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "name",
    },

    description: {
      allowNull: false,
      type: dataTypes.STRING,
    },
  });
  notificationEvents.associate = (models) => {};
  return notificationEvents;
};

module.exports = notificationEvents;
