const express = require("express");
const router = express.Router();
const { isauth } = require("../utilities/middleware/isauth");
const asyncWrap = require("../utilities/asyncWrap");

const {
  index,
  signup,
  signupsubmit,
} = require("../controllers/dashController");
const { isUserValidate } = require("../utilities/validations/uservalidation");

router.get("/", isauth, asyncWrap(index));

router
  .route("/signup")
  .get(isauth, asyncWrap(signup))
  .post(isauth, isUserValidate, asyncWrap(signupsubmit));

module.exports = router;
