const sharp = require("sharp");
const AWS = require("aws-sdk");
const rm = require("randomstring");
const db = require("../models");
const config = process.env;
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
  uploadAvatar = async (images = []) => {
    const [avatar] = await this.compressImages(images);
    const location = await this.upload(avatar, "avatar");
    return location;
  };
}
module.exports = Uploads;
