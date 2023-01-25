const sharp = require("sharp");
const AWS = require("aws-sdk");
const rm = require("randomstring");
const { redis } = require("../helpers/redis");
// const db = require("../models");
const config = process.env;
const Moralis = require("./Moralis.sdk");

const s3 = new AWS.S3({
  accessKeyId: config.spaces_access_key,
  secretAccessKey: config.spaces_secret_key,
  endpoint: config.spaces_endpoint,
});
class Uploads {
  compressImages = async (images = []) => {
    const compressed = await Promise.all(
      images.map(async (image) => {
        return await sharp(image).jpeg({ quality: 20 }).toBuffer();
      })
    );
    this.compressed = compressed;
    return compressed;
  };
  upload = async (image, path) => {
    const upload = await s3
      .upload({
        Bucket: config.spaces_name,
        Key: `${path}/${rm.generate(16)}.jpeg`,
        ACL: "public-read",
        Body: image,
      })
      .promise();

    return upload.Location;
  };

  uploadNft = async (imageBlobs = this.compressed, path = "nft") => {
    //re visit
    const uploaded = await Promise.all(
      imageBlobs.map(async (image) => {
        const location = await this.upload(image, path);
        return location;
      })
    );
    // this.uploaded = await db.images.bulkCreate(
    //   uploaded.map((imageUrl) => {
    //     return {
    //       url: imageUrl,
    //     };
    //   })
    // );
    // return this.uploaded;
  };
  uploadAvatar = async (images = [], path = "avatar") => {
    const [avatar] = await this.compressImages(images);
    const location = await this.upload(avatar, path);
    return location;
  };

  saveTempImages = async (namesOfImages = []) => {
    if (namesOfImages.length) {
      const key = rm.generate({ length: 16 });

      //expires in 20 mins
      await redis.setex(key, 1200, JSON.stringify(namesOfImages));
      return {
        key,
        images: JSON.parse(await redis.get(key)),
      };
    } else {
      throw {
        status: 400,
        message: "no image uploaded",
      };
    }
  };

  static tempImageForNft = async ({ base64, mime }) => {
    const key = `${rm.generate(5)}-temp-ipfs-image-${rm.generate(5)}`;
    //expires 10 mins
    await redis.setex(key, 600, JSON.stringify({ base64, mime }));
    return key;
  };

  static uploadFileToIpfs = async (image, mime, username) => {
    const upload = await Moralis.EvmApi.ipfs.uploadFolder({
      abi: [
        {
          path: `image/${username}-${rm.generate(6)}.${mime}`,
          content: image,
        },
      ],
    });
    return upload.toJSON();
  };
}
module.exports = Uploads;
