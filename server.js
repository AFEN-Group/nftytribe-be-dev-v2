const server = require("./app");
const db = require("./models");
const port = process.env.app_port;

db.sequelize.sync({ alter: true }).then(() => {
  server.listen(port, console.log.bind(this, `listening on port ::: ${port}`));
});
