// const db = require("@models");
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

  /**
   *
   * @param {string} name - name of the notification type
   * @param {number} id - id to either collection or listing
   * @param {number} userId - id to owner of generated notification
   */
  notifications.generateNotification = async (name, id) => {
    const [listing, collection] = await Promise.all([
      await db.nfts.findOne({
        where: {
          id,
        },
      }),
      await db.collections.findOne({
        where: {
          id,
        },
      }),
    ]);
    let text = "";
    switch (name) {
      case NotificationTypes["BID_PLACED"]:
        text = `A bid was placed on your item ${listing.name} ${
          listing.tokenId ?? ""
        }`;
        break;
      case NotificationTypes["SOLD"]:
        text = `Your Nft ${listing.name}${listing.tokenId ?? ""} has been sold`;
        break;
      case NotificationTypes["NEW_LISTING"]:
        text = `Your nft ${listing.name}${
          listing.tokenId ?? ""
        } has been listed! `;
        break;
      default:
        break;
    }
    const newNotification = await notifications.create({
      type: name,
      text,
      data: {
        listingId: listing.id,
        name: listing.name,
        tokenId: listing.tokenId ?? "",
      },
      userId: listing.userId,
    });
    return newNotification;
  };
  /**
   *
   * @param {number} collectionId id of collection
   * @param {Socket} socket an initiated socket instance
   * @param {number} batchLimit how may data to be created at a time
   */
  notifications.newListingCollection = async (
    collectionId,
    socket,
    batchLimit = 1000
  ) => {
    let page = 1;
    //get total count of users with this collection as favorite
    const [collection, count] = await Promise.all([
      await db.collections.findOne({
        where: {
          id: collectionId,
        },
      }),
      await db.collectionFavorites.count({
        where: {
          collectionId,
        },
      }),
    ]);

    const totalPages = Math.ceil(count / batchLimit);
    const offset = (page - 1) * batchLimit;
    const text = `A new nft has been listed from the collection ${collection.name}`;

    //process items in batches
    while (page <= totalPages) {
      console.log(totalPages, page, count);
      const allFavorites = await db.collectionFavorites.findAll({
        where: {
          collectionId,
        },
        limit: batchLimit,
        offset,
      });
      const newNotificationArray = allFavorites.map(({ userId }) => ({
        userId,
        text,
        type: NotificationTypes.NEW_LISTING_COLLECTION,
        data: {
          name: collection.name,
          id: collectionId,
        },
      }));
      await notifications.bulkCreate(newNotificationArray);
      if (socket) {
        //do the socket thing
        console.log("the socket thing");
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
  notifications.generateWatchedNotifications = async (
    type,
    listingId,
    socket,
    batchLimit = 1000
  ) => {
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
        data: {
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
  notifications.getNotifications = async ({ userId, limit, page }) => {
    const offset = (page - 1) * limit;
    const [total, notification] = await Promise.all([
      await notifications.count({
        where: {
          userId,
        },
      }),
      await notifications.findAll({
        where: {
          userId,
        },
        limit,
        offset,
      }),
    ]);
    return {
      results: notification,
      totalPages: Math.ceil(total / limit),
      limit,
      page,
    };
  };

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

  return notifications;
};

module.exports = notifications;
