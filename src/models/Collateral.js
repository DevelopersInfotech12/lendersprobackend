import mongoose from "mongoose";

const collateralSchema = new mongoose.Schema({
  lender:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrower:       { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
  loan:           { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
  assetType:      { type: String, enum: ["property", "gold_jewelry", "vehicle", "electronics", "document", "other"], required: true },
  description:    { type: String, required: true, trim: true },
  estimatedValue: { type: Number, required: true, min: 0 },
  image:          { type: String, trim: true },                        // base64 data URI or image URL
  depositDate:    { type: Date, required: true, default: Date.now },
  returnDate:     { type: Date },
  status:         { type: String, enum: ["held", "returned", "liquidated"], default: "held" },
  notes:          { type: String },
}, { timestamps: true });

const Collateral = mongoose.model("Collateral", collateralSchema);
export default Collateral;
