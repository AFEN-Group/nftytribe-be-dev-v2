const asyncHandler = require("express-async-handler");
const { validationResult, matchedData } = require("express-validator");
const checkError = require("@functions/checkError");
const Uploads = require("@functions/uploads");
const Users = require("@functions/users");
const Mailer = require("@functions/mailer");
const db = require("@models");

const register = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, { locations: ["body"] });
  const newUser = await new Users().createAccount(data);
  res.send(newUser);
});

const login = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const token = await new Users().loginUser(req.body.walletAddress);
  res.send(token);
});

const addEmail = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Users(req.user.id).addEmail(req.body.email);
  res.send(result);
});

const verifyEmail = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Users(req.user.id).verifyEmail(req.body.token);
  res.send(result);
});

const updateUser = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, {
    includeOptionals: true,
    locations: ["body"],
  });
  let url;
  if (req.file) {
    url = await new Uploads(req.user.id).uploadAvatar([req.file.buffer]);
  }
  const updated = await new Users().updateUser(data, req.user.id, url);
  res.send(updated);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await new Users().getUser(req.params.field);
  res.send(user);
});

const kycV1 = asyncHandler(async (req, res) => {
  const data = await checkError(req);
  const { id: userId } = req.user;

  //checking if user has email updated
  const { email, username } = await db.users.findOne({
    where: {
      id: userId,
    },
  });
  if (!email)
    throw {
      message: "Email not verified!",
      status: 400,
    };
  //uploaded files
  const { files } = req;
  const { id, selfie } = files;

  //throw error to be returned when files required not uploaded
  if (!selfie || !id)
    throw {
      message: "Please upload every necessary document!",
      status: 400,
    };

  //mail sender
  const mailer = new Mailer("Request", "Verification Request");

  //mail to be sent data
  const subject = `verification request from ${username}`;
  const to = [process.env.verification_email_address];

  /**
   * @type {import("@types/mailTypes").MailAttachment}
   */
  const attachment = [
    ...id.map((data) => {
      return {
        name: "identification." + data.mimetype.split("/")[1],
        type: data.mimetype,
        content: data.buffer.toString("base64"),
      };
    }),
    ...selfie.map((data) => {
      return {
        name: "selfie." + data.mimetype.split("/")[1],
        type: data.mimetype,
        content: data.buffer.toString("base64"),
      };
    }),
  ];
  // const url =
  //   process.env.NODE_ENV === "production"
  //     ? "https://dev.api.v2.nftytribe.io"
  //     : "https://test.nftytribe.io";
  const template = await db.emailTemplates.getAndSetValues("kyc", {
    email,
    name: data.fullName,
    ...data,
    links: data.socialLinks,
  });
  await mailer.sendEmail(
    {
      subject,
      html: template,
      to,
    },
    attachment
  );
  res.send({
    message: "Your request for verification has been sent!",
  });
});
module.exports = {
  register,
  login,
  addEmail,
  getUser,
  verifyEmail,
  updateUser,
  kycV1,
};
