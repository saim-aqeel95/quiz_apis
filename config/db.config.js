// const dotenv = require("dotenv");
// dotenv.config();
module.exports   = {
  connectionLimit : 10,
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};
