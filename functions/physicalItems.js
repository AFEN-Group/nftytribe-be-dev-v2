const { redis } = require("../helpers/redis");
const db = require("../models");
const randomString = require("randomstring");

exports.createPhysicalItems = async (data = {}) => {
  const key = randomString.generate({ length: 6 });
  data.images = await redis.getdel(data.imageKey); //get images if any
  delete data.imageKey; //delete imageKey if any exists
  await redis.setex(key, 900, JSON.stringify(data)); // expires in 15 mins
  return { ...data, key };
};

exports.linkPhysicalItems = async (key, listingId) => {
  const data = await redis.getdel(key); //delete key once gotten as its useless retaining the data
  if (data) {
    const item = await db.physicalItems.create({ ...data, nftId: listingId }); //store physical item to database

    //link uploaded images with
    return item;
  }
};

exports.tempPhysicalImages = async (namesOfImages = []) => {
  if (namesOfImages.length) {
    const key = randomString.generate({ length: 16 });
    await redis.setex(key, 1200, JSON.stringify(namesOfImages)); //expires in 20 mins
    return {
      key,
      images: await redis.get(key),
    };
  } else {
    throw {
      status: 400,
      message: "no image uploaded",
    };
  }
};
