const Joi = require("joi");
const asyncWrap = require("../asyncWrap");

module.exports.contractorValidateSchema = Joi.object({
  conName: Joi.string().required().label("Contractor Name"),
  conEmail: Joi.string().optional(),
  conPhone: Joi.string().optional(),
  unitPriceRate: Joi.number().min(1).required().label("unit Rate"),
  conAddress: Joi.string().required().label("Address"),
});

module.exports.isContractorValid = asyncWrap(async (req, res, next) => {
  const { value, error } = this.contractorValidateSchema.validate(req.body);
  const isCreateUrl = req.originalUrl === "/contractor/create" ? false : true;
  if (error) {
    const validateError = error.details[0].message;
    return res.render("contractor/create.ejs", {
      formData: value,
      validateError,
      update: isCreateUrl,
    });
  }

  next();
});
