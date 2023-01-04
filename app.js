const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const cors = require("cors");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("tiny"));

//routes
const user = require("./routes/user");
const hotel = require("./routes/hotel");

app.use("/api/v1", user);
app.use("/api/v1", hotel);

module.exports = app;
