module.exports.user = async (req, res, next) => {
  const user = req.params.userId;
  console.log(user);
  return res.render("userManagement/user.ejs");
};
