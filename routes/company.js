const express = require("express");
const router = express.Router();
const { isauth } = require("../utilities/middleware/isauth");
const asyncWrap = require("../utilities/asyncWrap");
const { index, createUpdate } = require("../controllers/companyController");
const {
  isCompanyDataValid,
} = require("../utilities/validations/companyValidation");

router
  .route("/create")
  .get(isauth, asyncWrap(index))
  .post(isauth, isCompanyDataValid, asyncWrap(createUpdate));

module.exports = router;
