require("dotenv").config();

const requiredVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};
