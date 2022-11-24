const {
  signup,
  login,
  forgotPasswordToken,
  passwordReset,
  changePassword,
  updateUserProfile,
  sendVerificationMail,
  verifyEmail,
  addAdmin,
  removeAdmin,
  adminGetAllAdminList,
  sendTestMail,
  signupTest,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = require("express").Router();

//user routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotPasswordToken);
router.route("/passwordreset/:token").post(passwordReset);
router.route("/passwordupdate").post(isLoggedIn, changePassword);
router.route("/profile/update").post(isLoggedIn, updateUserProfile);
router.route("/sendmail").post(sendVerificationMail);
router.route("/emailverification/:token").post(verifyEmail);
router.route("/sendtestmail").post(sendTestMail);

//admin routes
router
  .route("/updaterole/addadmin")
  .post(isLoggedIn, customRole("admin"), addAdmin);
router
  .route("/updaterole/removeadmin")
  .post(isLoggedIn, customRole("admin"), removeAdmin);
router
  .route("/admin/getAllAdminList")
  .get(isLoggedIn, customRole("admin"), adminGetAllAdminList);
module.exports = router;
