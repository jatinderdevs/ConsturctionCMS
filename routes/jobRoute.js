const express = require("express");
const router = express.Router();

const asyncWrap = require("../utilities/asyncWrap");
const {
  create,
  createPost,
  index,
  job,
  additionalCharges,
} = require("../controllers/jobController");

const { isJobDataValid } = require("../utilities/validations/jobValidate");

router.get("/index", asyncWrap(index));

router
  .route("/create")
  .get(asyncWrap(create))
  .post(isJobDataValid, asyncWrap(createPost));

router.post("/charges/", asyncWrap(additionalCharges));

router.get("/view/:id/:company", asyncWrap(job));

module.exports = router;
