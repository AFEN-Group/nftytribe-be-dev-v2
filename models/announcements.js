const announcements = (sequelize, dataTypes) => {
  const announcements = sequelize.define("announcements", {
    title: {
      allowNull: false,
      type: dataTypes.STRING,
    },
    description: {
      // allowNull: false,
      type: dataTypes.STRING,
      // defaultValue: process.env.default_announcements,
    },
  });
  announcements.associate = (models) => {};
  return announcements;
};

module.exports = announcements;
