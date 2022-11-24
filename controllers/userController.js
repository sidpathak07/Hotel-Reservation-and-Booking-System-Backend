const User = require("../models/user");
const validator = require("validator");
const crypto = require("crypto");
const cookieToken = require("../utils/cookieToken");
const { mailer, sendMailMark1 } = require("../utils/mailer");

//users
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  const isEmail = validator.isEmail(email);
  const isPassword = validator.isStrongPassword(password);
  const isName = !!name;

  if (!isEmail) {
    res.status(403).json({
      succes: false,
      message: "Enter valid email",
    });
  }

  if (!isPassword) {
    res.status(403).json({
      succes: false,
      message: "Enter valid password",
    });
  }

  if (!isName) {
    res.status(403).json({
      succes: false,
      message: "Enter valid Name",
    });
  }

  try {
    let user = await User.create(req.body);
    let token = await user.getEmailVerificationToken();
    user = await user.save({ validateBeforeSave: false });
    let isEmailVerificationMailSent;
    let message = `Please verify your account using following link <a>http://localhost:4000/api/v1/emailverification/${token}</a>`;
    let result = await mailer(email, message, "Email Verification");
    cookieToken(user, res, result);
  } catch (error) {
    res.status(203).json({
      success: false,
      error,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(403).json({
      success: false,
      message: "Enter Valid Email or Password",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(203).send("User not registered");
  }
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    res.status(203).json({
      success: false,
      message: "Incorrect Password",
    });
  }
  delete user.password;
  cookieToken(user, res, "");
};

exports.forgotPasswordToken = async (req, res, next) => {
  const { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    res.status(203).json({
      success: false,
      message: "Email not registered",
    });
  }
  const token = await user.getForgotPasswordToken();
  user = await user.save({ validateBeforeSave: false });
  let message = `Please reset your password using following link <a>http://localhost:4000/passwordreset/${token}`;
  mailer(email, message, "Password Reset Link")
    .then((result) => {
      res.status(200).json({
        success: true,
        message: "Email Sent Successfully",
      });
    })
    .catch((error) => {
      res.status(203).json({
        success: false,
        message: "Error....Please try again",
      });
    });
};

exports.passwordReset = async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmpassword } = req.body;

  if (password === confirmpassword) {
    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      forgotPasswordToken: encryptedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    user.password = password;
    user.forgotPasswordExpiry = null;
    user.forgotPasswordToken = "";
    user
      .save({ validateBeforeSave: false })
      .then((user) => {
        res.status(200).json({
          success: true,
          message: "Password changed successfully",
          user: {
            email: user.email,
            name: user.name,
          },
        });
      })
      .catch((err) => {
        res.status(203).json({
          success: false,
          message: "Link expired please try again",
          err,
        });
      });
  } else {
    res.status(203).json({
      success: false,
      message: "Password and Confirm Password does not match",
      err,
    });
  }
};

exports.changePassword = async (req, res) => {
  const { _id } = req.user;
  const { password, confirmpassword } = req.body;
  console.log(_id);
  const user = await User.findById(_id);

  if (password === confirmpassword) {
    user.password = password;
    user
      .save({ validateBeforeSave: false })
      .then((user) => {
        res.status(200).json({
          success: true,
          message: "Password changed successfully",
          user: {
            email: user.email,
            name: user.name,
          },
        });
      })
      .catch((err) => {
        res.status(203).json({
          success: false,
          message: "Failed to change Password...try again",
          err,
        });
      });
  } else {
    res.status(203).json({
      success: false,
      message: "Password and Confirm Password don't match",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { _id } = req.user;
  let updatedInfo = {};
  if ("name" in req.body) {
    updatedInfo.name = req.body.name;
  }
  if ("phoneno" in req.body) {
    updatedInfo.phoneno = req.body.phoneno;
  }
  const user = await User.findByIdAndUpdate(_id, updatedInfo, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  }).select("name phoneno");
  if (!user) {
    res.status(203).json({
      succes: false,
      message: "Failed to update user....Please try again",
    });
  }

  res.status(200).json({
    success: true,
    message: "Information Updated",
    user,
  });
};

exports.updateEmail = async (req, res) => {
  const { _id } = req.user;
  const { email } = req.body;
  const isValidEmail = validator.isEmail(email);
  if (isValidEmail) {
    try {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          email: email,
          isVerifiedEmail: false,
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );
      const token = await user.getEmailVerificationToken();
      user = await user.save({ validateBeforeSave: false });
      const isEmailSent = await mailer(
        email,
        `Please click the given link to complete email verification  link: http://localhost:4000/api/v1/emailverification/${token}`,
        "Email Verification"
      );
      if (isEmailSent) {
        res.status(200).json({
          success: true,
          message: "Email updated successfully please verify the email.",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Email updated successfully Please verify email later",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Update failed please try again...",
        error,
      });
    }
  }
};

exports.sendVerificationMail = async (req, res) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
    let token = await user.getEmailVerificationToken();
    user = await user.save({ validateBeforeSave: false });
    let message = `<p>Please click the given link to verify email <a>http://localhost:4000/api/v1/emailverification/${token}</a></p>`;
    mailer(email, token, "Email Verification")
      .then((result) => {
        res.json({
          success: true,
          result: result.messageId,
        });
      })
      .catch((error) => {
        res.json({
          success: false,
          error: error.message,
        });
      });
  } catch (error) {
    res.status(200).json({
      success: false,
      error,
    });
  }
};

exports.sendTestMail = async (req, res) => {
  mailer("kali@g.com", "Test1", "Test1")
    .then((result) => {
      console.log("result", result);
      res.json({
        success: true,
        result,
      });
    })
    .catch((error) => {
      res.json({
        error: error,
      });
    });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    let user = await User.findOne({
      emailVerificationToken: encryptedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    user = await User.findByIdAndUpdate(
      user._id,
      {
        isVerifiedEmail: true,
        emailVerificationExpiry: "",
        emailVerificationToken: "",
      },
      { new: true, runValidators: true }
    );
    res.status(203).json({
      success: true,
      message: "Email verificaiton completed",
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Email Verification Failed...try again later",
      error,
    });
  }
};

//admin routes
//add admin
exports.addAdmin = async (req, res) => {
  const { userId } = req.body;
  let user;
  try {
    user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: `${user.email} is now admin`,
      user,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: `failed to update ${user.email} to admin`,
    });
  }
};

exports.removeAdmin = async (req, res) => {
  const { userId } = req.body;
  let user;
  try {
    user = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: `${user.email} is now user`,
      user,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: `failed to update ${user.email} role to user`,
    });
  }
};

exports.adminGetAllAdminList = async (req, res) => {
  try {
    const users = await User.find({ role: "admin" }).select(
      "_id email name isVerifiedEmail"
    );
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Unknown error",
    });
  }
};
