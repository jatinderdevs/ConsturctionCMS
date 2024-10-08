const Joi = require("joi");
const asyncWrap = require("../asyncWrap");

//address object validate
const adresSchema = Joi.object({
  street: Joi.optional(),
  suburb: Joi.string().required().label("suburb"),
  postCode: Joi.string().required().label("postCode"),
});

//bank object validate
const bankSchema = Joi.object({
  ABN_number: Joi.number().required().label("ABN Number"),
  bankName: Joi.string().required().label("Bank Name"),
  BSB: Joi.number().required().label("BSB"),
  accountNumber: Joi.number().required().label("Account Number"),
});

const companyValidateSchema = Joi.object({
  companyName: Joi.string().required(),
  contactNumber: Joi.string().required(),
  email: Joi.string().required(),
  address: adresSchema,
  bankDetails: bankSchema,
}).unknown(true);

module.exports.isCompanyDataValid = asyncWrap(async (req, res, next) => {
  const { value, error } = companyValidateSchema.validate(req.body);

  if (error) {
    const validateError = error.details[0].message;
    //check the url if request come from edit then page reneder accordingly
    const isEditValidation = req.originalUrl === "/company/edit" ? true : false;

    if (isEditValidation) {
      return res.render("company/companyEdit.ejs", {
        formData: value,
        validateError,
      });
    }
    return res.render("company/create.ejs", {
      formData: value,
      validateError,
    });
  }

  next();
});
