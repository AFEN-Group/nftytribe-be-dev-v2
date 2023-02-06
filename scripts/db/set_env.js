const mysql = require("mysql2");
const fs = require("fs");

const createENVFile = async () => {
  await new Promise((resolve, reject) => {
    try {
      const sql = mysql.createConnection({
        user: process.env.db_username || "root",
        password: process.env.db_password,
        host: process.env.db_host || "localhost",
        database: process.env.database || "nftytribe",
        port: process.env.db_port || 3306,
      });
      sql.connect((err) => {
        if (err) process.exit(1);
        const query = `select * from configs`;
        sql.query(query, (err, result, fields) => {
          if (err) process.exit(1);
          fs.open("./.env", "w", (err, fd) => {
            if (err) exit;
            result.forEach(({ name, value }) => {
              fs.write(
                fd,
                `${name}=${value}\n`,
                (err) => err && process.exit(1)
              );
            });
            sql.end();
            resolve();
          });
        });
      });
    } catch (err) {
      process.exit(1);
    }
  });
};

createENVFile();
