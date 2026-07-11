import Repayment from "../models/Repayment.js";
import Loan from "../models/Loan.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";

export const addRepayment = async (req, res, next) => {
  const loan = await Loan.findOne({ _id: req.body.loan, lender: req.user._id });
  if (!loan) return next(new AppError("Loan not found", 404));
  if (loan.status === "closed") return next(new AppError("Loan is already closed", 400));

  const remaining = loan.totalRepayable - loan.totalPaid;
  if (req.body.amount > remaining) {
    return next(new AppError(`Amount exceeds remaining balance of ₹${remaining}`, 400));
  }

  // Split into principal and interest (proportional for flat)
  const interestRatio = loan.totalInterest / loan.totalRepayable;
  const interestPaid = Math.min(req.body.amount * interestRatio, loan.totalInterest);
  const principalPaid = req.body.amount - interestPaid;

  const repayment = await Repayment.create({
    ...req.body,
    lender: req.user._id,
    borrower: loan.borrower,
    interestPaid: Math.round(interestPaid * 100) / 100,
    principalPaid: Math.round(principalPaid * 100) / 100,
  });

  // Update loan totalPaid
  loan.totalPaid += req.body.amount;
  if (loan.totalPaid >= loan.totalRepayable) {
    loan.status = "closed";
  } else {
    // Payment caught up — clear any default flag and push the
    // recurring monthly due date forward one cycle.
    if (loan.status === "defaulted" || loan.status === "overdue") loan.status = "active";
    const base = loan.nextDueDate && loan.nextDueDate > loan.startDate ? new Date(loan.nextDueDate) : new Date(loan.startDate);
    base.setMonth(base.getMonth() + 1);
    loan.nextDueDate = base;
  }
  await loan.save();

  await repayment.populate("borrower", "name");
  success(res, repayment, "Repayment recorded", 201);
};

export const getRepayments = async (req, res) => {
  const { loanId, borrowerId } = req.query;
  const filter = { lender: req.user._id };
  if (loanId) filter.loan = loanId;
  if (borrowerId) filter.borrower = borrowerId;

  const repayments = await Repayment.find(filter)
    .populate("borrower", "name phone")
    .populate("loan", "principalAmount interestRate")
    .sort("-paymentDate");
  success(res, repayments, "Repayments fetched");
};

export const deleteRepayment = async (req, res, next) => {
  const repayment = await Repayment.findOne({ _id: req.params.id, lender: req.user._id });
  if (!repayment) return next(new AppError("Repayment not found", 404));

  // Reverse loan totalPaid
  const loan = await Loan.findById(repayment.loan);
  if (loan) {
    loan.totalPaid -= repayment.amount;
    if (loan.status === "closed" && loan.totalPaid < loan.totalRepayable) loan.status = "active";
    if (loan.nextDueDate) {
      const rolledBack = new Date(loan.nextDueDate);
      rolledBack.setMonth(rolledBack.getMonth() - 1);
      loan.nextDueDate = rolledBack;
    }
    await loan.save();
  }

  await repayment.deleteOne();
  success(res, null, "Repayment deleted");
};
