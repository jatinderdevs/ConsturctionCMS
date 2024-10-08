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
  genrateInvoice,
  deleteJob,
  invoicePaid,
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

router.post("/delete/:id", asyncWrap(deleteJob));

router.get("/genrate/:jobId", asyncWrap(genrateInvoice));

router.post("/invoicestatus/:jobId", asyncWrap(invoicePaid));

module.exports = router;
