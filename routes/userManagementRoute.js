const express = require("express");
const router = express.Router();
const {
  user,
  userMembership,
  updateMembership,
} = require("../controllers/userManagementController");

const asyncWrap = require("../utilities/asyncWrap");

router.route("/:userId").get(asyncWrap(user));

router
  .route("/membership/:userId")
  .get(asyncWrap(userMembership))
  .post(asyncWrap(updateMembership));

module.exports = router;
