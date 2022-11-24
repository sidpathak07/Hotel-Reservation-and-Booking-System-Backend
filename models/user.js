const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    validate: [validator.isStrongPassword, "Enter strong password"],
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "Please select from admin and user",
    },
    default: "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneno: {
    type: String,
    required: true,
    maxLength: 13,
    validate: [validator.isMobilePhone, "Please enter correct mobile number"],
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  managedHotels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
  ],
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.validatePassword = async function (userpassword) {
  return await bcrypt.compare(userpassword, this.password);
};

UserSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TIME }
  );
};

UserSchema.methods.getForgotPasswordToken = function () {
  const token = crypto.randomBytes(10).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.forgotPasswordExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

UserSchema.methods.getEmailVerificationToken = function () {
  const token = crypto.randomBytes(10).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};
module.exports = mongoose.model("User", UserSchema);
