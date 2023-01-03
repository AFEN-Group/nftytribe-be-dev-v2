const transactions = (sequelize, dataTypes) => {
  const transactions = sequelize.define("transactions", {
    amount: {
      type: dataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    price: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    erc20Info: {
      type: dataTypes.JSON,
      allowNull: false,
    },
    nftInfo: {
      type: dataTypes.JSON,
      allowNull: false,
    },
    listingInfo: {
      type: dataTypes.JSON,
      allowNull: false,
    },
  });

  transactions.associate = (models) => {
    transactions.belongsTo(models.users, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
      as: "buyer",
    });
    transactions.belongsTo(models.users, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
      as: "seller",
    });
  };

  return transactions;
};

module.exports = transactions;
