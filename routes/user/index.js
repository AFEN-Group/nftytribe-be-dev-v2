const { tempUploads } = require("@helpers/multer");
const {
  getUser,
  register,
  login,
  updateUser,
  addEmail,
  verifyEmail,
  kycV1,
} = require("../../controllers/users");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  createUserValidation,
  loginValidation,
  userUpdateValidation,
  addEmailValidation,
  verifyEmailValidation,
  avatarUpload,
  userVerificationValidationV1,
} = require("./validations");

const user = require("express").Router();

user.route("/:field").get(getUser);
user
  .route("/:field")
  .patch(
    userProtect,
    avatarUpload.single("avatar"),
    userUpdateValidation,
    updateUser
  );
user.route("/signup").post(createUserValidation, register);
user.route("/login").post(loginValidation, login);
user.route("/email").post(userProtect, addEmailValidation, addEmail);
user
  .route("/email/verify")
  .post(userProtect, verifyEmailValidation, verifyEmail);
user.route("/kyc-v1/").post(
  userProtect,
  tempUploads.fields([
    { name: "id", maxCount: 1 },
    { name: "selfie", maxCount: 2 },
  ]),
  userVerificationValidationV1,
  kycV1
);
module.exports = user;
