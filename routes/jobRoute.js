const express = require("express");
const router = express.Router();

const asyncWrap = require("../utilities/asyncWrap");
const {
  create,
  createPost,
  index,
  job,
  additionalCharges,
  edit,
  update,
} = require("../controllers/jobController");

const { isJobDataValid } = require("../utilities/validations/jobValidate");

router.get("/index", asyncWrap(index));

router
  .route("/create")
  .get(asyncWrap(create))
  .post(isJobDataValid, asyncWrap(createPost));

router.route("/edit/:id").get(asyncWrap(edit)).post(asyncWrap(update));

router.post("/charges/", asyncWrap(additionalCharges));

router.get("/view/:id/:company", asyncWrap(job));

module.exports = router;
