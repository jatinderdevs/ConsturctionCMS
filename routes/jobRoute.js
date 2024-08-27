const express = require("express");
const asyncWrap = require("../utilities/asyncWrap");
const {
  create,
  createPost,
  index,
  job,
} = require("../controllers/jobController");
const router = express.Router();

router.get("/index", asyncWrap(index));

router.route("/create").get(asyncWrap(create)).post(asyncWrap(createPost));

router.get("/view/:id/:company", asyncWrap(job));

module.exports = router;
