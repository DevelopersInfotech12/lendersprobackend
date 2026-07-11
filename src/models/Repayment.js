import mongoose from "mongoose";

const repaymentSchema = new mongoose.Schema({
  lender:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loan:            { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
  borrower:        { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
  amount:          { type: Number, required: true, min: 1 },
  paymentDate:     { type: Date, required: true, default: Date.now },
  paymentMode:     { type: String, enum: ["cash", "upi", "bank_transfer", "cheque", "other"], default: "cash" },
  principalPaid:   { type: Number, default: 0 },
  interestPaid:    { type: Number, default: 0 },
  notes:           { type: String },
}, { timestamps: true });

const Repayment = mongoose.model("Repayment", repaymentSchema);
export default Repayment;
