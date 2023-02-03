const { logger } = require("../helpers/logger");
const { redis } = require("../helpers/redis");
const db = require("../models");
const randomString = require("randomstring");

exports.createPhysicalItems = async (data = {}) => {
  const key = randomString.generate({ length: 6 });

  //get images if any
  data.images = await redis.getdel(data.imageKey);

  //delete imageKey if any exists
  delete data.imageKey;

  // expires in 15 mins
  await redis.setex(key, 900, JSON.stringify(data));
  return { ...data, key };
};

exports.linkPhysicalItems = async (key, listingId) => {
  //delete key once gotten as its useless retaining the data
  const data = JSON.parse(await redis.getdel(key));
  if (data) {
    //store physical item to database
    // console.log(data);
    const item = await db.physicalItems.create({ ...data, nftId: listingId });
    //update the listing to physical=true
    await db.nfts.update(
      {
        physical: true,
      },
      {
        where: {
          id: listingId,
        },
      }
    );
    //link uploaded images with
    data.images &&
      (await db.uploads.bulkCreate(
        JSON.parse(data.images).map((url) => ({
          url,
          physicalItemId: item.id,
        }))
      ));
  } else {
    logger(
      {
        key,
        listingId,
        message: "attempted to link but couldn't, probably expired!",
      },
      "link-physical-item"
    );
  }
};
