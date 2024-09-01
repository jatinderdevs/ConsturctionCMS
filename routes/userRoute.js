const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  signin,
  postSignin,
  profile,
  logout,
} = require("../controllers/userController");

const { redirectUrl, isauth } = require("../utilities/middleware/isauth");

const asyncWrap = require("../utilities/asyncWrap");

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
router.get("/logout", asyncWrap(logout));

router.get("/profile", isauth, asyncWrap(profile));

module.exports = router;
