"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "notificationEvents",
      [
        {
          name: "NFTSold",
          description:
            "Congratulations, {username}! Your NFT {nft_name} has been sold for {price} {currency}.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "PutOnSale",
          description:
            "Hey {username}, you've successfully listed your NFT {nft_name} for sale.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "AccountUpdate",
          description:
            "Hello {username}, your account information has been updated successfully.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "WatchedNFTSold",
          description:
            "Hello, {username}! The NFT {nft_name} you were watching has been sold.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "NewAuction",
          description:
            "Attention {username}, your NFT {nft_name} is now up for auction!",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "PutOffSale",
          description:
            "Dear {username}, your NFT {nft_name} has been put off-sale.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "SuccessfulPurchase",
          description:
            "Congratulations, {username}! You have successfully purchased the NFT {nft_name} for {price} {currency}.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "NewBid",
          description:
            "Hey {username}, a new bid has been placed on your NFT {nft_name}.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "BidConfirmed",
          description:
            "Congratulations, {username}! Your bid for the NFT {nft_name} has been confirmed.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Add more events as needed
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("notificationEvents", null, {});
  },
};
