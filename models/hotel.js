const mongoose = require("mongoose");
const validator = require("validator");
const HotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  email: {
    type: mongoose.Schema.Types.String,
    validate: [validator.isEmail, "Please enter email in correct format"],
  },
  phoneno: {
    type: mongoose.Schema.Types.String,
    validate: [validator.isMobilePhone, "Please enter correct mobile number"],
  },
  amenities: {
    type: mongoose.Schema.Types.Array,
  },
  images: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  roomType: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
    },
  ],
  checkIn: {
    type: String,
    required: true,
  },
  checkOut: {
    type: String,
    required: true,
  },
  bookingHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  location: {
    coordinates: {
      type: mongoose.Schema.Types.Array,
      required: true,
      index: { type: "2dsphere", sparse: true },
    },
  },
  ratings: [
    {
      custId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: mongoose.Schema.Types.Number,
        required: true,
      },
      comment: {
        type: mongoose.Schema.Types.String,
        required: true,
      },
    },
  ],
  averageRating: {
    type: mongoose.Schema.Types.Number,
    default: 0,
  },
  numberOfRatings: {
    type: mongoose.Schema.Types.Number,
    default: 0,
  },
});
HotelSchema.index({
  hotelName: "text",
  city: "text",
  state: "text",
  description: "text",
});

module.exports = mongoose.model("Hotel", HotelSchema);
