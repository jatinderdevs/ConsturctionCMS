const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/asyncWrap");

const {
  index,
  signup,
  signupsubmit,
} = require("../controllers/dashController");

const { isUserValidate } = require("../utilities/validations/uservalidation");

router.get("/", asyncWrap(index));

router
  .route("/signup")
  .get(asyncWrap(signup))
  .post(isUserValidate, asyncWrap(signupsubmit));

module.exports = router;
