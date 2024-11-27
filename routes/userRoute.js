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

const {
  isCompany,
  isContractor,
} = require("../utilities/middleware/misMiddleware");

const asyncWrap = require("../utilities/asyncWrap");
const {
  validateProfile,
} = require("../utilities/validations/userProfileValidation");

router
  .route("/signin")
  .get(signin)
  .post(
    redirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/signin",
      failureFlash: true,
    }),
    asyncWrap(postSignin)
  );

router.get("/profile", isauth, isCompany, asyncWrap(profile));

router
  .route("/profileupdate")
  .get(asyncWrap(editProfile))
  .post(validateProfile, asyncWrap(updateProfile));

router.get("/logout", asyncWrap(logout));

module.exports = router;
