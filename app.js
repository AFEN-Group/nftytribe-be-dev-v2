const express = require("express");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const route = require("./routes");
const cors = require("cors");
const errorHandler = require("./middlewares/errorhandler.middleware");
const hooks = require("./webhooks");
const { startSocket } = require("./helpers/socket");
// const logger = require("morgan");
const t = require("@functions/physicalItems");
const test = require("@routes/test");
const db = require("@models");
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  })
);
app.disable("x-powered-by");

app.use("/api", route);
app.use("/hook", hooks);
app.use("/test", test);

//error handler

const start = async () => {
  const { default: AdminJS } = await import("adminjs");
  const AdminJSSequelize = await import("@adminjs/sequelize");
  const { default: AdminJSExpress } = await import("@adminjs/express");
  AdminJS.registerAdapter(AdminJSSequelize);

  const admin = new AdminJS({
    rootPath: "/admin",
    resources: [
      db.users,
      db.addresses,
      db.transactions,
      db.nfts,
      db.chains,
      db.categories,
      db.bids,
      db.emailTemplates,
      db.networks,
      db.collections,
    ],
    // databases: [db],
    branding: {
      companyName: "Afen",
    },
  });
  const adminRouter = AdminJSExpress.buildRouter(admin);

  app.use(admin.options.rootPath, adminRouter);

  app.use(errorHandler);
  const server = http.createServer(app);
  startSocket(server);

  return server;
};
module.exports = start;
