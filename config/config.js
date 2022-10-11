module.exports = {
  username: process.env.db_username,
  password: process.env.db_password,
  database: process.env.db_name,
  host: process.env.db_host,
  dialect: "mysql",
  port: process.env.db_port,
};
