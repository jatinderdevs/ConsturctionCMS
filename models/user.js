const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      require: true,
    },
    image: String,
    isactive: Boolean,
    email: {
      type: String,
      require: true,
    },
    contactNumber: String,
    role: String,
    companyId: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "company",
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);
