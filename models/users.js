const Mailer = require("@functions/mailer");
const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 * @param {import("@types/physicalItems").DB} db
 */

const users = (sequelize, dataTypes, db) => {
  const users = sequelize.define("users", {
    email: {
      type: dataTypes.STRING,
      unique: "email",
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: dataTypes.STRING,
      allowNull: true,
      unique: "username",
    },
    bio: {
      type: dataTypes.STRING,
    },
    twitter: {
      type: dataTypes.STRING,
      validate: {
        isUrl: true,
        isTwitter: (string) => {
          if (
            !/(https:\/\/twitter.com\/(?![a-zA-Z0-9_]+\/)([a-zA-Z0-9_]+))/g.test(
              string
            )
          ) {
            throw "Invalid twitter profile url";
          }
        },
      },
    },
    website: {
      type: dataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    verified: {
      type: dataTypes.BOOLEAN,
      defaultValue: false,
    },
    walletAddress: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: "walletAddress",
    },
  });

  users.associate = (models) => {
    users.hasOne(models.avatar, {
      foreignKey: {
        unique: "userId",
      },
      onDelete: "cascade",
    });
    users.hasOne(models.emailVerifications, {
      foreignKey: {
        unique: "userId",
      },
      onDelete: "cascade",
    });
    users.hasOne(models.addresses, {
      onDelete: "cascade",
    });
    users.hasMany(models.collectionLikes, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    users.hasMany(models.bids, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    users.hasMany(models.collectionFavorites, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    users.hasMany(models.nfts, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    users.hasMany(models.collections, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    users.hasMany(models.listingWatchers, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });

    users.hasMany(models.transactions, {
      onDelete: "SET NULL",
      as: "buyer",
      foreignKey: "buyerId",
    });
    users.hasMany(models.transactions, {
      onDelete: "SET NULL",
      as: "seller",
      foreignKey: "sellerId",
    });
    // users.hasMany(models.physicalItemBuyers, {
    //   onDelete: "cascade",
    // });
    // users.belongsToMany(models.notifications, {
    //   through: models.userNotifications,
    // });
    users.hasMany(models.notifications);
  };
  users.beforeUpdate((user, options) => {
    const prev = user.previous();
    if (!prev.verified) {
      db.emailTemplates
        .getAndSetValues("verified", { name: user.username })
        .then(async (result) => {
          const html = result;
          const mailer = new Mailer("noreply", "NftyTribe");
          await mailer.sendEmail({
            subject: "Account Verified",
            html,
            to: [user.email],
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
  users.beforeBulkUpdate(async (user, options) => {
    if (user.where?.id) {
      const result = await users.findOne({
        where: {
          id: user.where.id,
        },
      });
      const event = await db.notificationEvents.findOne({
        where: {
          name: "AccountUpdate",
        },
      });

      const notification = await db.notifications.create(
        {
          userId: result.id,
          notificationEventId: event.id,
          parameters: {
            username: result.username,
          },
        },
        {
          include: { model: db.notificationEvents },
        }
      );
    }
  });

  return users;
};

module.exports = users;
