const mysql = require("mysql2");

const createENVFile = async () => {
  mysql.createConnection({
    user: process.env.db_username || "root",
    password: process.env.db_password,
    host: process.env.db_host || "localhost",
    database: process.env.database || "nftytribe",
    port: process.env.db_port || 3306,
  });
};
