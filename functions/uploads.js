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
  /**
   *
   * @param {Array<Buffer>} images - images as buffers
   * @param {number} quality - quality of compression 10 - 100
   * @param {number} width - width in pixels to be resized
   * @returns {Promise<Array<Buffer>>} - an array of buffer
   */
  compressImages = async (images = [], quality = 20, width = 1000) => {
    const compressed = await Promise.all(
      images.map(async (image) => {
        return await sharp(image).resize(width).jpeg({ quality }).toBuffer();
      })
    );
    this.compressed = compressed;
    return compressed;
  };

  /**
   *
   * @param {Buffer} image - the image to be uploaded as buffer
   * @param {string} path - path to be stored on bucket
   * @param {string} ext - extension name
   * @returns {Promise<string>} - url to file
   */
  upload = async (image, path, ext = "jpeg") => {
    const upload = await s3
      .upload({
        Bucket: config.spaces_name,
        Key: `${path}/${rm.generate(16)}.${ext}`,
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
          path: `${username}-${rm.generate(6)}.${mime}`,
          content: image,
        },
      ],
    });
    return upload.toJSON();
  };
}
module.exports = Uploads;
