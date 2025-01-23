import { Sequelize } from "sequelize";
import { DB_Name } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();

const dBURI = `${process.env.MYSQL_URI}/${DB_Name}`;
const sequelize = new Sequelize(dBURI, {
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };
