import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  lender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrower:  { type: mongoose.Schema.Types.ObjectId, ref: "Borrower" },
  loan:      { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
  title:     { type: String, required: true, trim: true },
  dueDate:   { type: Date, required: true },
  type:      { type: String, enum: ["call", "visit", "payment_followup", "document", "other"], default: "payment_followup" },
  status:    { type: String, enum: ["pending", "done"], default: "pending" },
  notes:     { type: String },
}, { timestamps: true });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
