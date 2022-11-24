const mongoose = require("mongoose");

const RoomType = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  totalrooms: {
    type: mongoose.Schema.Types.Number,
    required: true,
  },
  baseprice: {
    type: mongoose.Schema.Types.Number,
    required: true,
  },
  description: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
});
