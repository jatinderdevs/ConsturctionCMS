const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const ejsMate = require("ejs-mate");

//settting View engines and views
app.set("view engine", "ejs");
app.set("views", "views");

//set ejsMate as engine
app.engine("ejs", ejsMate);

//serve static file
app.use(express.static(path.join(__dirname, "public")));

app.use("/", (req, res, next) => {
  res.render("auth/signin.ejs");
});

app.listen(8080, (err) => {
  console.log(err);
  mongoose.connect("mongodb://localhost:27017/cms_db");
});
