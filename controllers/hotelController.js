const hotel = require("../models/hotel");
const Hotel = require("../models/hotel");
const cloudinary = require("cloudinary").v2;

//admin controllers
exports.adminAddHotel = async (req, res) => {
  let {
    hotelName,
    description,
    formattedAddress,
    city,
    state,
    pincode,
    email,
    phoneno,
    latitude,
    longitude,
    checkIn,
    checkOut,
    amenities,
    photoLinks,
    roomType,
  } = req.body;
  const hotelBody = {
    hotelName,
    description,
    address: formattedAddress,
    city,
    state,
    pincode,
    location: {
      coordinates: [latitude, longitude],
    },
    email,
    phoneno,
    checkIn,
    checkOut,
    amenities,
    images: photoLinks,
    roomType,
  };
  try {
    let hotel = await Hotel.create(hotelBody);
    res.status(200).json({
      success: true,
      message: "Hotel added",
      hotel,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Hotel not added",
      error,
    });
  }
};

exports.adminGetHotelById = async (req, res) => {
  const { hotelId } = req.body;
  try {
    const hotel = await Hotel.findById(hotelId);
    res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Hotel not found",
    });
  }
};

exports.adminDeleteHotelById = async (req, res) => {
  let { hotelId } = req.body;
  try {
    let hotel = await Hotel.findById(hotelId);
    let rooms = hotel.roomType;
    for (let i = 0; i < rooms.length; i++) {
      // let roomImages = rooms[i].roomImages;
      // for (let j = 0; j < roomImages.length; j++)
      //   console.log(roomImages[j], rooms[i].title);
      // console.log(rooms[i].roomImages);
      for (let j = 0; j < rooms[i].roomImages.length; j++) {
        console.log(rooms[i].roomImages[j].id, rooms[i].title);
        let result = await cloudinary.uploader.destroy(
          rooms[i].roomImages[j].id
        );
        console.log(result);
      }
    }
    for (let i = 0; i < hotel.images.length; i++) {
      let result = await cloudinary.uploader.destroy(hotel.images[i].id);
    }

    hotel.delete();
    // console.log(hotel.roomType);
    res.status(200).json({
      success: true,
      message: "Hotel Deleted Successfully!!!",
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Cannot Delete Hotel....Please try again later",
    });
  }
};

exports.adminUpdateHotelById = async (req, res) => {
  const fields = [
    "hotelName",
    "description",
    "address",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "email",
    "phoneno",
    "checkIn",
    "checkOut",
    "amenities",
  ];
  const { hotelId } = req.body;
  let updatedHotelData = {};
  let hotel = await Hotel.findById(hotelId);
  let updatedImages = hotel.images;
  let failedToDeleteImage = [];
  if (req.body.deletePhotos) {
    let deletePhotos = req.body.deletePhotos.split(",");
    for (let i = 0; i < deletePhotos.length; i++) {
      let result = await cloudinary.uploader.destroy(deletePhotos[i]);
      if (result.result == "ok") {
        updatedImages = updatedImages.filter(
          (image) => image.id !== deletePhotos[i]
        );
      } else {
        failedToDeleteImage.push(deletePhotos[i]);
      }
    }
  }

  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "Hotel Images",
        }
      );
      let data = {
        id: result.public_id,
        secure_url: result.secure_url,
      };
      updatedImages.push(data);
    }
  }
  for (let i = 0; i < fields.length; i++) {
    if (fields[i] in req.body) {
      if (fields[i] === "pincode") {
        updatedHotelData[fields[i]] = parseInt(req.body[fields[i]]);
      } else {
        updatedHotelData[fields[i]] = req.body[fields[i]];
      }
    }
  }
  try {
    hotel = await Hotel.findByIdAndUpdate(hotelId, updatedHotelData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      error,
    });
  }
};

exports.checkPhotoUpload = async (req, res) => {
  console.log(req.body);
  console.log(req.photos);
  // for(let i=0;i<req.body.hotel['photo'])
};

//user controllers
exports.getSingleHotelById = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const hotel = await Hotel.findById(hotelId);
    hotel.bookingHistory = null;
    res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "Hotel not found",
    });
  }
};

exports.getHotelListBySearch = async (req, res) => {
  const { query } = req.body;
  console.log(req.body);
  // const { page } = req.params;
  try {
    const hotels = await Hotel.find({ $text: { $search: query } }).select(
      "hotelName address city state "
    );
    // .limit(page * 10);
    // .skip((page - 1) * 10)
    res.status(200).json({
      success: true,
      hotels,
    });
  } catch (error) {
    res.status(203).json({
      success: false,
      message: "No Hotels found.....Please search by Hotel Name/City/State",
    });
  }
};

exports.notaddReview = async (req, res) => {
  const { hotelId, custId, rating, comment } = req.body;
  // Hotel.findById(hotelId)
  //   .then((hotel) => {
  //     let alreadyReviewed = product.reviews.find(
  //       (rev) => rev.user.toString() == custId.toString()
  //     );
  //     if (alreadyReviewed) {
  //       hotel.ratings.forEach((rating) => {
  //         if (rating.custId.toString() == custId.toString()) {
  //           rating.rating = rating;
  //           rating.comment = comment;
  //         }
  //       });
  //     } else {
  //       hotel.ratings.push({
  //         custId,
  //         rating: Number(rating),
  //         comment,
  //       });
  //       hotel.numberOfRatings = hotel.ratings.length;
  //     }
  //     hotel.averageRating =
  //       hotel.ratings.reduce((total, rating) => total + rating.rating, 0) /
  //       hotel.ratings.length;
  //     hotel.save({ validateBeforeSave: true }).then((updatedHotel) => {
  //       res.status(200).json({
  //         success: true,
  //         message: "Review added successfully",
  //         hotel,
  //       });
  //     });
  //   })
  //   .catch((error) => {
  //     success: false, error;
  //   });
  Hotel.findById(hotelId)
    .then((hotel) => {
      // console.log(hotel);
      let alreadyReviewed = hotel.reviews.find(
        (rev) => rev.user.toString() == custId.toString()
      );
      console.log(alreadyReviewed);
      if (alreadyReviewed) {
        console.log("alreadyReviewed");
        hotel.ratings.forEach((rating) => {
          if (rating.custId.toString() == custId.toString()) {
            rating.rating = rating;
            rating.comment = comment;
          }
        });
      } else {
        console.log("not alreadyReviewed");

        hotel.ratings.push({
          custId,
          rating: Number(rating),
          comment,
        });
        hotel.numberOfRatings = hotel.ratings.length;
      }

      hotel.averageRating =
        hotel.ratings.reduce((total, rating) => total + rating.rating, 0) /
        hotel.ratings.length;
      return hotel;
    })
    .then((updatedHotel) => {
      console.log(updatedHotel);
    })
    .catch((error) => {
      success: false;
      error;
    });
};

exports.deleteReview = async (req, res) => {
  const { hotelId } = req.body;
  const custId = req.user._id;
  Hotel.findById(hotelId)
    .then((hotel) => {
      let hasReviewed = hotel.ratings.find(
        (rating) => rating.custId.toString() == custId.toString()
      );
      if (hasReviewed) {
        hotel.ratings = hotel.ratings.filter(
          (rating) => rating.custId.toString() !== custId.toString()
        );
        hotel.numberOfRatings = hotel.ratings.length;
      }
      return hotel;
    })
    .then(async (updatedHotel) => {
      return updatedHotel.save({ validateBeforeSave: true });
    })
    .then((savedHotel) => {
      res.status(200).json({
        success: true,
        message: "Review Deleted",
        savedHotel,
      });
    })
    .catch((error) => {
      res.status(203).json({
        success: false,
        error,
      });
    });
};

exports.addReview = async (req, res) => {
  const { hotelId, custId, rating, comment } = req.body;
  Hotel.findById(hotelId)
    .then((hotel) => {
      let alreadyReviewed = hotel.ratings.find(
        (rev) => rev.custId.toString() == custId.toString()
      );
      if (alreadyReviewed === true) {
        console.log("alreadyReviewed");
        hotel.ratings.forEach((rating) => {
          if (rating.custId.toString() == custId.toString()) {
            rating.rating = rating;
            rating.comment = comment;
          }
        });
      } else {
        console.log("not alreadyReviewed");
        hotel.ratings.push({
          custId,
          rating: Number(rating),
          comment,
        });
        hotel.numberOfRatings = hotel.ratings.length;
        hotel.averageRating =
          hotel.ratings.reduce((avg, rating) => avg + rating.rating, 0) /
          hotel.ratings.length;
        return hotel;
      }
    })
    .then(async (updatedHotel) => {
      return await updatedHotel.save({ validateBeforeSave: true });
    })
    .then((savedHotel) => {
      res.status(200).json({
        success: true,
        savedHotel,
      });
    })
    .catch((error) => {
      res.status(203).json({
        success: false,
        error,
      });
    });
  // res.json({
  //   hotelId,
  //   custId,
  //   rating,
  //   comment,
  // });
};
