const { logger } = require("@helpers/logger");
const db = require("@models");
const { parentPort } = require("worker_threads");

parentPort.on("message", ({ contractAddress, url }) => {
  let count = 0;
  const maxCount = 12;
  const timeout = 10 * 1000;

  const saveImage = async () => {
    const collection = await db.collections.findOne({
      where: {
        contractAddress,
      },
    });
    if (!collection && count < maxCount) {
      return setTimeout(async () => {
        await saveImage();
        count++;
        logger(
          `Trying to update collection coverImage ${count} times`,
          undefined,
          "info"
        );
      }, timeout);
    }
    if (count > maxCount) {
      logger(
        `failed to save coverImage. ${contractAddress} not found after ${
          10 * 12
        } seconds`,
        undefined,
        "error"
      );
      return;
    }
    //found contractAddress
    await db.collections.update(
      { coverImage, url },
      {
        where: {
          contractAddress,
        },
      }
    );
  };
  saveImage();
});
