const asyncWrap = require("../utilities/asyncWrap");
const User = require("../models/user");

exports.signin = (req, res, next) => {
  return res.render("auth/signin.ejs");
};

exports.signup = asyncWrap(async (req, res, next) => {
  let fakeUser = new User({
    username: "jazz",
    fullname: "jatinder singh",
    image:
      "https://www.pngitem.com/pimgs/m/581-5813504_avatar-dummy-png-transparent-png.png",
    isactive: true,
    email: "jssingh134@gmail.com",
    contactNumber: "+604 125 356",
    role: "superadmin",
  });

  await User.register(fakeUser, "123456");

  res.render("auth/signin.ejs");
});
