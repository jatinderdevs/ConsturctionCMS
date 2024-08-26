const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/asyncWrap");
const { index } = require("../controllers/adminController");

router.get("/", asyncWrap(index));

module.exports = router;
