const { body, param } = require("express-validator");
const rs = require("randomstring");
const db = require("../../models");
const multer = require("multer");
const createUserValidation = [
  body("username")
    .trim()
    .escape()
    .customSanitizer((value) => {
      return "user-" + rs.generate(8);
    }),
  body("walletAddress")
    .not()
    .isEmpty()
    .trim()
    .custom(async (walletAddress) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw "invalid wallet address";
      }
      const user = await db.users.findOne({ where: { walletAddress } });
      if (user) throw "user with wallet address already exists";
      return true;
    }),
];

const loginValidation = [
  body("walletAddress")
    .not()
    .isEmpty()
    .trim()
    .custom((value) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw "invalid wallet address";
      }
      return true;
    }),
];

const userUpdateValidation = [
  body("username")
    .optional()
    .trim()
    .custom(async (username) => {
      const user = await db.users.findOne({
        where: {
          username,
        },
      });
      if (user) throw "username already exists";
      return true;
    }),

  body("twitter").isURL().optional({ checkFalsy: false }),
  body("website").isURL().optional({ checkFalsy: false }),
  body("bio").not().isEmpty().optional({ checkFalsy: false }),
];

const addEmailValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .custom(async (email) => {
      const user = await db.users.findOne({ where: { email } });
      if (user) throw "Email is already associated with a user";
      return true;
    }),
];

const verifyEmailValidation = [body("token").not().isEmpty().trim()];

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8e6,
  },
});

const userVerificationValidationV1 = [
  body(["fullName", "phoneNumber"]).not().isEmpty(),
  body("phoneNumber").isMobilePhone(),
  body(["professionalName", "referralCode"])
    .optional({ checkFalsy: true })
    .isString(),
  body("socialLinks")
    .optional()
    .custom((arr) => {
      const data = JSON.parse(arr);
      //if array contains data
      if (!data.length) throw "add at least one social links";
      //if content of array is string
      const regex = new RegExp(
        "^(?:https?://)?(?:www.)?(?:[a-zA-Z0-9-]+.)+[a-zA-Z]{2,}(?:/[^s]*)?$"
      );
      for (x of data) {
        if (!regex.test(x)) {
          throw `${x} is not a url`;
        }
      }
      return true;
    })
    .customSanitizer((arr) => {
      console.log(arr);
      return JSON.parse(arr);
    }),
];

module.exports = {
  createUserValidation,
  loginValidation,
  addEmailValidation,
  verifyEmailValidation,
  userUpdateValidation,
  avatarUpload,
  userVerificationValidationV1,
};
