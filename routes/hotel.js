const { route } = require("../app");
const {
  getSingleHotelById,
  getHotelListBySearch,
  adminAddHotel,
  adminDeleteHotelById,
  adminGetHotelById,
  addReview,
  deleteReview,
  checkPhotoUpload,
} = require("../controllers/hotelController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = require("express").Router();
const multer = require("multer");
const upload = multer();
//user routes
// router.route("/hotel/querysearch/:page").get(getHotelListBySearch);
router.route("/hotel/querysearch").post(getHotelListBySearch);
router
  .route("/hotel/review")
  .post(isLoggedIn, customRole("user"), addReview)
  .delete(isLoggedIn, customRole("user"), deleteReview);
router.route("/hotel/:hotelId").get(getSingleHotelById);

//admin routes
router
  .route("/hotel/addhotel")
  .post(isLoggedIn, customRole("admin"), adminAddHotel);

router
  .route("/hotel/deletehotel")
  .delete(isLoggedIn, customRole("admin"), adminDeleteHotelById);

router
  .route("/hotel/updatehotel")
  .put(isLoggedIn, customRole("admin"), adminUpdateHotelById);

router
  .route("/showhotel")
  .get(isLoggedIn, customRole("admin"), adminGetHotelById);

router
  .route("/admin/photouploadtest")
  .post(upload.array("photos"), checkPhotoUpload);

module.exports = router;
