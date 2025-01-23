import { connectDB, sequelize } from "./DB/dBConnection.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    // Sync models to create tables in the database
    return sequelize.sync({alter : true}); // force: false prevents dropping existing tables
  })
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error(
      "Something went wrong while connecting to the database:\n",
      err
    );
  });
