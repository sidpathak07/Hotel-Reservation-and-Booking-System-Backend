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
  createAdmin,
  adminSearchEmail,
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
  .route("/admin/createAdmin")
  .post(isLoggedIn, customRole("admin"), createAdmin);
router
  .route("/updaterole/addadmin")
  .put(isLoggedIn, customRole("admin"), addAdmin);
router
  .route("/updaterole/removeadmin")
  .put(isLoggedIn, customRole("admin"), removeAdmin);
router
  .route("/admin/getAllAdminList")
  .get(isLoggedIn, customRole("admin"), adminGetAllAdminList);
router
  .route("/admin/getUser")
  .post(isLoggedIn, customRole("admin"), adminSearchEmail);
module.exports = router;
