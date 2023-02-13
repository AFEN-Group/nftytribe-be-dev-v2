const db = require("@models");
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

exports.tryGetUser = expressAsyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    if (!authorization.toLocaleLowerCase().includes("bearer")) {
      throw {
        code: 401,
        message: "invalid authorization headers",
      };
    }

    const result = jwt.verify(authorization.split(" ")[1], process.env.jwt_key);
    const user = await db.users.findOne({ where: { id: result.id } });

    if (!user) {
      // throw {
      //   code: 401,
      //   message: "user does not exist",
      // };
    } else req.user = user.dataValues;
  }

  //add checks for if user blocked
  next();
});
