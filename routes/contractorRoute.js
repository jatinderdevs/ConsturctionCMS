const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/asyncWrap");
const {
  index,
  create,
  postCreate,
  update,
  edit,
} = require("../controllers/contractorController");
const {
  isContractorValid,
} = require("../utilities/validations/contractorValidation");

router.get("/index", asyncWrap(index));

router
  .route("/create")
  .get(asyncWrap(create))
  .post(isContractorValid, asyncWrap(postCreate));

router
  .route("/edit/:id")
  .get(asyncWrap(edit))
  .post(isContractorValid, asyncWrap(update));
module.exports = router;
