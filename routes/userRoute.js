const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  signin,
  postSignin,
  profile,
  logout,
  editProfile,
  updateProfile,
} = require("../controllers/userController");

const { redirectUrl, isauth } = require("../utilities/middleware/isauth");

const asyncWrap = require("../utilities/asyncWrap");
const {
  validateProfile,
} = require("../utilities/validations/userProfileValidation");

router
  .route("/signin")
  .get(asyncWrap(signin))
  .post(
    redirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/signin",
      failureFlash: true,
    }),
    asyncWrap(postSignin)
  );

router.get("/profile", isauth, asyncWrap(profile));

router
  .route("/profileupdate")
  .get(asyncWrap(editProfile))
  .post(validateProfile, asyncWrap(updateProfile));

router.get("/logout", asyncWrap(logout));

module.exports = router;
