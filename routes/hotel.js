const { route } = require("../app");
const {
  getSingleHotelById,
  getHotelListBySearch,
  adminAddHotel,
  adminDeleteHotelById,
  adminUpdateHotelById,
  adminGetHotelById,
  addReview,
  deleteReview,
} = require("../controllers/hotelController");
const { isLoggedIn, customRole } = require("../middlewares/user");
const router = require("express").Router();

//user routes
router.route("/hotel/querysearch/:page").get(getHotelListBySearch);
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
  .post(isLoggedIn, customRole("admin"), adminDeleteHotelById);

router
  .route("/hotel/updatehotel")
  .put(isLoggedIn, customRole("admin"), adminUpdateHotelById);

router
  .route("/showhotel")
  .get(isLoggedIn, customRole("admin"), adminGetHotelById);
module.exports = router;
