const mongoose = require("mongoose");
 
const trademarkSchema = new mongoose.Schema({
  companyName: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  brandName: { type: String, default: "" },
  hasTrademark: { type: String, enum: ["Yes", "No"], default: undefined },
  logo: { type: String, maxlength: 6 * 1024 * 1024, default: "" },
  trademarkClass: { type: String, default: "" },
  vianacode: { type: String, default: "" },
}, { timestamps: true });
 
const Trademark = mongoose.model("Trademark", trademarkSchema);
module.exports = Trademark;
 
