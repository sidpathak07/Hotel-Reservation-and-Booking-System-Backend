const mongoose = require("mongoose");
const connectToDb = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("DB CONNECTED");
    })
    .catch((err) => {
      console.log("DB CONNECTION FAILED");
      process.exit(1);
    });
};
module.exports = connectToDb;
