// const db = require("@models");

import { AdminJS, ComponentLoader } from "adminjs";
import { bundle } from "@adminjs/bundler";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";

const init = async (app, db, MySQLStore) => {
  //init component loader
  const componentLoader = new ComponentLoader();

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

  const components = {
    Dashboard: componentLoader.add("Dashboard", "./components/Dashboard"),
  };
  await bundle({
    customComponentsInitializationFilePath: "./components/Dashboard.jsx",
    destinationDir: "../.adminjs",
  });

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
      db.collections,
      db.admins,
      db.physicalItems,
      db.supportedTokens,
      db.emailLists,
    ],
    // databases: [db],
    locale: {
      translations: {
        en: {
          components: {
            Login: {
              welcomeHeader: "Welcome",
              welcomeMessage: "Proceed with your email and Password",
            },
          },
        },
      },
    },
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

    dashboard: {
      handler: async () => {},
      component: components.Dashboard,
      componentLoader,
    },
    componentLoader,
  });
  const store = new MySQLStore({
    host: process.env.db_host,
    password: process.env.db_password,
    database: process.env.database ?? process.env.db_name,
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

export default init;
