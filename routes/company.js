const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/asyncWrap");
const { isCompany } = require("../utilities/middleware/misMiddleware");

const {
  index,
  createUpdate,
  companyProfile,
  edit,
  update,
} = require("../controllers/companyController");

const {
  isCompanyDataValid,
} = require("../utilities/validations/companyValidation");

router
  .route("/create")
  .get(asyncWrap(index))
  .post(isCompanyDataValid, asyncWrap(createUpdate));

router.get("/profile", isCompany, asyncWrap(companyProfile));

router
  .route("/edit")
  .get(isCompany, asyncWrap(edit))
  .post(isCompany, isCompanyDataValid, asyncWrap(update));

module.exports = router;
