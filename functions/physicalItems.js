const { redis } = require("../helpers/redis");
const db = require("../models");
const randomString = require("randomstring");

exports.createPhysicalItems = async (data = {}) => {
  const key = randomString.generate({ length: 6 });
  await redis.setex(key, 900, JSON.stringify(data)); // expires in 15 mins
  return { ...data, key };
};

exports.linkPhysicalItems = async (key, listingId) => {
  const data = await redis.getdel(key); //delete key once gotten as its useless retaining the data
  if (data) {
    const item = await db.physicalItems.create({ ...data, nftId: listingId });
    return item;
  }
};
