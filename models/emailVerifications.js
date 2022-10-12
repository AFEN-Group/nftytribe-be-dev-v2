const emailVerifications = (sequelize, dataTypes) => {
  const emailVerifications = sequelize.define("emailVerifications", {
    token: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  });

  emailVerifications.associate = (models) => {
    emailVerifications.belongsTo(models.users, {
      foreignKey: {
        unique: "userId",
      },
      onDelete: "cascade",
    });
  };
  return emailVerifications;
};

module.exports = emailVerifications;
