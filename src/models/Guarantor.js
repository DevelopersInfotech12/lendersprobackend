import mongoose from "mongoose";

const guarantorSchema = new mongoose.Schema({
  lender:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrower:          { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
  loan:              { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
  name:              { type: String, required: true, trim: true },
  phone:             { type: String, required: true, trim: true },
  address:           { type: String, trim: true },
  relationToBorrower:{ type: String, trim: true },
  idType:            { type: String, enum: ["aadhaar", "pan", "passport", "voter_id", "driving_license", "other"], default: "aadhaar" },
  idNumber:          { type: String, trim: true },
  notes:             { type: String },
}, { timestamps: true });

const Guarantor = mongoose.model("Guarantor", guarantorSchema);
export default Guarantor;
