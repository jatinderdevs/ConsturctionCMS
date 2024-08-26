const express = require("express");
const router = express.Router();
const passport = require("passport");
const controller = require("../controllers/userController");
const { redirectUrl } = require("../utilities/middleware/isauth");

router.get("/signin", controller.signin);

router.post(
  "/signin",
  redirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/auth/signin",
    failureFlash: true,
  }),
  controller.postSignin
);
router.get("/logout", controller.logout);

module.exports = router;
