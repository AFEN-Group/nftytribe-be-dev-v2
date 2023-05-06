const db = require("@models");

const init = async (app) => {
  const { default: AdminJS } = await import("adminjs");
  const AdminJSSequelize = await import("@adminjs/sequelize");
  const { default: AdminJSExpress, build } = await import("@adminjs/express");
  const session = require("express-session");
  const MySQLStore = require("express-mysql-session")(session);

  const DEFAULT_ADMIN = {
    email: process.env.admin_email,
    password: process.env.admin_password,
  };
  const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
  };

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
      db.admins,
    ],
    // databases: [db],
    branding: {
      companyName: "Nftytribe",
      softwareBrothers: false,
      logo:
        process.env.app_url +
        "/static/logo.770e4c4ac171fb416d3346755d8cd086.svg",
      theme: {
        colors: {
          primary100: "#F3BB1C",
        },
      },
    },
    pages: {
      login: {
        component: build.bundle("../jsx-components/login/Login.jsx"),
      },
    },
  });
  const store = new MySQLStore({
    host: process.env.db_host,
    password: process.env.db_password,
    database: process.env.db_name,
    user: process.env.db_username,
    port: process.env.db_port,
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "nftytribeAdmin",
      cookiePassword: process.env.admin_cookie_password,
    },
    null,
    {
      saveUninitialized: true,
      resave: true,
      store,
    }
  );

  app.use(admin.options.rootPath, adminRouter);
};

module.exports = init;
