const avatar = (sequelize, dataTypes) => {
  const avatar = sequelize.define("avatar", {
    url: {
      allowNull: false,
      type: dataTypes.STRING,
      defaultValue: process.env.default_avatar,
      validate: {
        isUrl: true,
      },
    },
  });
  avatar.associate = (models) => {
    avatar.belongsTo(models.users, {
      foreignKey: {
        unique: "userId",
      },
      onDelete: "cascade",
    });
  };
  return avatar;
};

module.exports = avatar;
