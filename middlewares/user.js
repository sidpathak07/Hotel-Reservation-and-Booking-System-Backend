const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(`You are not allowed to access this resource`, 403)
      );
    }
    next();
  };
};

exports.isLoggedIn = async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    res.status(400).json({
      success: false,
      message: "Please LogIn to access resource",
    });
  }
  const decode = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decode.id);
  req.user = user;

  next();
};
