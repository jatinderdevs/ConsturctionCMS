const User = require("../models/user");

module.exports.user = async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findOne({ _id: userId }).populate({
    path: "companyId",
  });

  return res.render("userManagement/user.ejs", { user });
};
