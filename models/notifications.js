// const db = require("@models");
const { socketEmitter } = require("@helpers/socket");
const NotificationTypes = require("../types/notificationTypes");
const { Sequelize, DataTypes } = require("sequelize");
const { Socket } = require("socket.io");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 * @param {import("@types/physicalItems").DB} db
 */
const notifications = (sequelize, dataTypes, db) => {
  const notifications = sequelize.define("notifications", {
    message: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    isRead: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    parameters: {
      allowNull: false,
      type: dataTypes.JSON,
    },
  });

  notifications.associate = (model) => {
    notifications.belongsToMany(model.users, {
      through: model.userNotifications,
    });
    notifications.belongsTo(model.users);
    notifications.belongsTo(model.notificationEvents);
  };

  //all single

  notifications.generateSingleNotification = async ({
    type,
    title,
    tokenId,
    collectionId,
    transactionId,
    nftId,
    socket,
    userId,
  }) => {
    let text = "";
    switch (type) {
      case NotificationTypes["BID_PLACED"]:
        text = `A bid was placed on your item ${title}-${tokenId ?? ""}`;
        break;
      case NotificationTypes["SOLD"]:
        text = `Your Nft ${title}-${tokenId ?? ""} has been sold`;
        break;
      case NotificationTypes["NEW_LISTING"]:
        text = `Your nft ${title}-${tokenId ?? ""} has been listed! `;
        break;
      default:
        break;
    }
    const newNotification = await notifications.create({
      type,
      text,
      collectionId,
      nftId,
      transactionId,
    });
    await newNotification.addUsers([userId]);
    socketEmitter.to(String(userId)).emit("notification", newNotification);
    return newNotification;
  };

  // all multiple

  notifications.generateMultipleNotification = async ({
    collectionId,
    nftId,
    transactionId,
    socket,
    batchLimit = 1000,
    type,
    name,
    nftName,
    tokenId,
  }) => {
    let page = 1;
    //get total count of users with this collection as favorite
    let data;
    let count;
    let text;
    if (name === "watch" && type === NotificationTypes.SOLD_WATCH) {
      data = await db.transactions.findOne({
        where: {
          id: transactionId,
        },
      });
      count = await db.listingWatchers.count({
        where: {
          nftId,
        },
      });
      text = `nft ${nftName}-${tokenId} you were watching has been sold `;
    } else if (
      name === "favorite" &&
      type === NotificationTypes.NEW_LISTING_COLLECTION
    ) {
      data = await db.collections.findOne({
        where: {
          id: collectionId,
        },
      });
      count = await db.collectionFavorites.count({
        where: {
          collectionId,
        },
      });
      text = `A new nft has been listed from the collection ${data.name}`;
    }

    const totalPages = Math.ceil(count / batchLimit);
    const offset = (page - 1) * batchLimit;

    const newNotification = await notifications.create({
      type,
      text,
      transactionId,
      collectionId,
      nftId,
    });
    //process items in batches
    while (page <= totalPages) {
      console.log(totalPages, page, count);
      let users = [];

      if (name === "watch" && type === NotificationTypes.SOLD_WATCH) {
        // const watchers = await db.listingWatchers.findAll({
        //   where: {
        //   }
        // })
      } else if (
        name === "favorite" &&
        type === NotificationTypes.NEW_LISTING_COLLECTION
      ) {
        const allFavorites = await db.collectionFavorites.findAll({
          where: {
            collectionId,
          },
          limit: batchLimit,
          offset,
        });
        users = allFavorites.map((data) => data.userId);
      }
      await newNotification.addUsers(users);
      // await notifications.bulkCreate(newNotificationArray);

      for (let id of users) {
        socketEmitter.to(String(id)).emit("notification", newNotification);
      }
      page++;
    }
  };
  /**
   *
   * @param {string} type
   * @param {number} listingId
   * @param {number} batchLimit number to be updated at a time
   * @returns
   */
  notifications.generateWatchedNotifications = async ({
    type,
    listingId,
    extraData = {},
    socket,
    batchLimit = 1000,
  }) => {
    let page = 1;
    //listing data and watchers count
    const [listing, count] = await Promise.all([
      await db.nfts.findOne({
        where: {
          id: listingId,
        },
      }),
      await db.listingWatchers.count({
        where: {
          nftId: listingId,
        },
      }),
    ]);
    const totalPages = Math.ceil(count / batchLimit);
    const offset = (page - 1) * batchLimit;
    const text =
      NotificationTypes.SOLD_WATCH === type
        ? `${listing.name}${listing.tokenId ?? ""} has been sold`
        : `A bid was placed on #${listing.name}${listing.tokenId ?? ""}`;

    //batch process
    while (page <= totalPages) {
      const watchers = await db.listingWatchers.findAll({
        where: {
          nftId: listingId,
        },
        limit: batchLimit,
        offset,
      });

      const notification = watchers.map(({ userId }) => ({
        userId,
        type,
        data: NotificationTypes.SOLD_WATCH
          ? extraData
          : {
              name: listing.name,
              id: listingId,
              tokenId: listing.tokenId,
            },
        text,
      }));
      await notifications.bulkCreate(notification);
      if (socket) {
        //do the socket thing
      }
      page++;
    }
    return true;
  };
  /**
   *
   * @param {{
   *  userId: string,
   *  limit: number,
   *  page: number
   *
   * }} param0
   */

  /**
   *
   * @param {number} userId
   */
  notifications.markAllRead = async (userId) => {
    return await notifications.update(
      { isRead: true },
      {
        where: {
          userId,
        },
      }
    );
  };

  notifications.beforeCreate(async (notification, options) => {
    // /**
    //  * @type {import("sequelize").CreateOptions}
    //  */
    // const opt = options;

    const { notificationEventId, parameters } = notification;

    const event = await db.notificationEvents.findOne({
      where: {
        id: notificationEventId,
      },
    });
    const { description } = event;
    notification.message = description;

    // validate that the required parameters are available
    const keys = description.match(/(?<=\{)(.*?)(?=\})/g);

    for (let key of keys) {
      if (!parameters[key]) {
        throw { message: `key ${key} not found in parameter!` };
      } else {
        notification.message = notification.message.replace(
          `{${key}}`,
          parameters[key]
        );
      }
    }
    // return notification;
    // all passed
  });

  notifications.afterCreate(async (notification) => {
    socketEmitter.to(notification.userId.toString()).emit("notification", {
      ...notification.dataValues,
      notificationEvent: (await notification.getNotificationEvent()).dataValues,
    });
  });
  return notifications;
};

module.exports = notifications;
