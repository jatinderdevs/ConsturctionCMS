const Contractor = require("../models/contractor");

module.exports.index = async (req, res, next) => {
  const { _id, companyId } = req.user;

  const contractors = await Contractor.find({ username: _id, companyId });

  return res.render("contractor/index", { contractors });
};

module.exports.create = async (req, res, next) => {
  return res.render("contractor/create", {
    formData: {},
    validateError: {},
    update: false,
  });
};

module.exports.postCreate = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const createContractor = new Contractor({
    ...req.body,
    username: _id,
    companyId,
  });

  await createContractor.save();
  return res.redirect("/contractor/index");
};

module.exports.edit = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const { id } = req.params;

  const contractor = await Contractor.findOne({
    _id: id,
    username: _id,
    companyId,
  });

  return res.render("contractor/create", {
    formData: contractor,
    validateError: {},
    update: true,
  });
};

module.exports.update = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const { id } = req.params;

  await Contractor.findOneAndUpdate(
    {
      _id: id,
      username: _id,
      companyId,
    },
    {
      ...req.body,
      username: _id,
      companyId,
    }
  );
  return res.redirect("/contractor/index");
};
