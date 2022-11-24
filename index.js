require("dotenv").config();
const app = require("./app");
const connectToDb = require("./config/dbconfig");
const cloudinary = require("cloudinary");

connectToDb();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(4000, () => {
  console.log("SERVER STARTED AT PORT 4000");
});
