const server = require("./app");
const port = process.env.PORT;
server.listen(port, console.log.bind(this, `listening on port ::: ${port}`));
