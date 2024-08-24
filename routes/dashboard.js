const express = require("express");
const router = express.Router();
const { isauth } = require("../utilities/middleware/isauth");

router.get("/", isauth, (req, res, next) => {
  //   console.log(req.user);
  return res.render("dashboard/index.ejs");
});

module.exports = router;
