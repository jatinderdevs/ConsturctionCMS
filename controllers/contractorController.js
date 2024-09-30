const Contractor = require("../models/contractor");

const Job = require("../models/Jobs");

module.exports.index = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const contractors = await Contractor.find({ username: _id, companyId });
  return res.render("contractor/index", { contractors, row: 0 });
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
  req.flash("success", "contractor has been created successfully");
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
  req.flash("success", "Details has been updated successfully");
  return res.redirect("/contractor/index");
};

module.exports.Cdelete = async (req, res, next) => {
  const { C_id } = req.body;
  const { _id } = req.user;

  const isJobExist = await Job.findOne({
    "contractorDetails.contractor": C_id,
  });

  if (!isJobExist) {
    await Contractor.findOneAndDelete({ _id: C_id, username: _id });
    req.flash("error", "contractor removed successfully");
    return res.redirect("/contractor/index");
  } else {
    req.flash(
      "error",
      "to prevent Job data loss, Please deactivate the contractor insted delete"
    );
    return res.redirect("/contractor/index");
  }
};
