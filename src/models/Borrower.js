import mongoose from "mongoose";

const borrowerSchema = new mongoose.Schema({
  lender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:     { type: String, required: true, trim: true },
  phone:    { type: String, required: true, trim: true },
  email:    { type: String, trim: true, lowercase: true },
  address:  { type: String, trim: true },
  idType:   { type: String, enum: ["aadhaar", "pan", "passport", "voter_id", "driving_license", "other"], default: "aadhaar" },
  idNumber: { type: String, trim: true },
  notes:    { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Borrower = mongoose.model("Borrower", borrowerSchema);
export default Borrower;
