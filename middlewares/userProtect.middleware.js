const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const db = require("../models");
const userProtect = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw {
      code: 401,
      message: "No token found!",
    };
  }
  if (!authorization.toLocaleLowerCase().includes("bearer")) {
    throw {
      code: 401,
      message: "invalid authorization headers",
    };
  }
  const result = jwt.verify(authorization.split(" ")[1], process.env.jwt_key);
  const user = await db.users.findOne({ where: { id: result.id } });

  if (!user)
    throw {
      code: 401,
      message: "user does not exist",
    };

  req.user = user.dataValues;

  //add checks for if user blocked
  next();
});

module.exports = userProtect;
