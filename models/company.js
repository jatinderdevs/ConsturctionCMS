const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "https://shorturl.at/rg7cJ",
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      suburb: String,
      postCode: Number,
    },

    bankDetails: {
      ABN_number: Number,
      BSB: Number,
      accountNumber: Number,
      bankName: String,
    },

    username: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("company", companySchema);
