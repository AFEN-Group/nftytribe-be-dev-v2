const server = require("./app");
const db = require("@models");
const port = process.env.app_port;

//gracefully shutting down
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully");
  (await server()).close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcing shut down");
    process.exit(1);
  }, 10000);
});

db.sequelize.sync({ force: true }).then(async () => {
  (await server()).listen(
    port,
    console.log.bind(this, `listening on port ::: ${port}`)
  );
});
