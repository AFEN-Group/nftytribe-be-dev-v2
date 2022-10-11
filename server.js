const server = require("./app");
const db = require("./models");
const port = process.env.PORT;

db.sequelize.sync().then(() => {
  server.listen(port, console.log.bind(this, `listening on port ::: ${port}`));
});
