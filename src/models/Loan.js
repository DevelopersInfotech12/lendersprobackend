import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  lender:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrower:        { type: mongoose.Schema.Types.ObjectId, ref: "Borrower", required: true },
  principalAmount: { type: Number, required: true, min: 1 },
  interestRate:    { type: Number, required: true, min: 0 },        // % per month
  interestType:    { type: String, enum: ["flat", "reducing"], default: "flat" },
  // "installment" = recurring EMI (principal + interest split across months)
  // "interest_only" = borrower pays only monthly interest; principal is a lump sum due at end
  repaymentType:   { type: String, enum: ["installment", "interest_only"], default: "installment" },
  durationMonths:  { type: Number, required: true, min: 1 },
  startDate:       { type: Date, required: true },
  dueDate:         { type: Date },                                    // computed
  purpose:         { type: String, trim: true },
  status:          { type: String, enum: ["active", "closed", "defaulted", "overdue"], default: "active" },
  nextDueDate:     { type: Date },                                    // next monthly installment due
  totalInterest:   { type: Number, default: 0 },
  totalRepayable:  { type: Number, default: 0 },
  monthlyInstallment: { type: Number, default: 0 },
  totalPaid:       { type: Number, default: 0 },
  notes:           { type: String },
}, { timestamps: true });

// Compute derived fields before save
loanSchema.pre("save", function (next) {
  if (this.interestType === "flat") {
    this.totalInterest = (this.principalAmount * this.interestRate * this.durationMonths) / 100;
  } else {
    // Simple reducing-balance approximation
    let balance = this.principalAmount;
    let totalInt = 0;
    const monthlyPrincipal = this.principalAmount / this.durationMonths;
    for (let i = 0; i < this.durationMonths; i++) {
      totalInt += (balance * this.interestRate) / 100;
      balance -= monthlyPrincipal;
    }
    this.totalInterest = Math.round(totalInt * 100) / 100;
  }
  this.totalRepayable = this.principalAmount + this.totalInterest;

  // Expected recurring monthly amount, shown on the Recurring page.
  if (this.repaymentType === "interest_only") {
    // Borrower pays interest every month; principal is a bullet payment on dueDate.
    this.monthlyInstallment = Math.round(((this.principalAmount * this.interestRate) / 100) * 100) / 100;
  } else {
    this.monthlyInstallment = this.durationMonths > 0
      ? Math.round((this.totalRepayable / this.durationMonths) * 100) / 100
      : 0;
  }

  // Due date = startDate + durationMonths
  const due = new Date(this.startDate);
  due.setMonth(due.getMonth() + this.durationMonths);
  this.dueDate = due;

  // First monthly installment due one month after start
  if (this.isNew) {
    const nextDue = new Date(this.startDate);
    nextDue.setMonth(nextDue.getMonth() + 1);
    this.nextDueDate = nextDue;
  }

  next();
});

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
