import Loan from "../models/Loan.js";
import Borrower from "../models/Borrower.js";
import Repayment from "../models/Repayment.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";
import { autoMarkDefaults } from "../utils/loanStatus.js";

export const createLoan = async (req, res, next) => {
  const borrower = await Borrower.findOne({ _id: req.body.borrower, lender: req.user._id });
  if (!borrower) return next(new AppError("Borrower not found", 404));

  const loan = await Loan.create({ ...req.body, lender: req.user._id });
  await loan.populate("borrower", "name phone");
  success(res, loan, "Loan created", 201);
};

export const getLoans = async (req, res) => {
  await autoMarkDefaults(req.user._id);
  const { status, borrower } = req.query;
  const filter = { lender: req.user._id };
  if (status) filter.status = status;
  if (borrower) filter.borrower = borrower;

  const loans = await Loan.find(filter)
    .populate("borrower", "name phone email")
    .sort("-createdAt");
  success(res, loans, "Loans fetched");
};

// GET /loans/recurring/due — every loan is a recurring monthly installment
// (EMI) commitment via nextDueDate. This groups them into overdue / due
// this week / all, for the Recurring Loans page.
export const getRecurringLoans = async (req, res) => {
  await autoMarkDefaults(req.user._id);

  const loans = await Loan.find({ lender: req.user._id, status: { $in: ["active", "defaulted"] } })
    .populate("borrower", "name phone email")
    .sort("nextDueDate");

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdue  = loans.filter((l) => l.nextDueDate && l.nextDueDate < now);
  const upcoming = loans.filter((l) => l.nextDueDate && l.nextDueDate >= now && l.nextDueDate <= weekAhead);

  const monthlyExpected = loans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0);

  success(res, {
    loans,
    overdue,
    upcoming,
    stats: {
      activeCount: loans.length,
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
      monthlyExpected: Math.round(monthlyExpected),
    },
  }, "Recurring loans fetched");
};

export const getLoan = async (req, res, next) => {
  await autoMarkDefaults(req.user._id);
  const loan = await Loan.findOne({ _id: req.params.id, lender: req.user._id })
    .populate("borrower", "name phone email address idType idNumber");
  if (!loan) return next(new AppError("Loan not found", 404));

  const repayments = await Repayment.find({ loan: loan._id }).sort("-paymentDate");
  success(res, { loan, repayments }, "Loan fetched");
};

export const updateLoan = async (req, res, next) => {
  const allowed = [
    "borrower", "principalAmount", "interestRate", "interestType",
    "repaymentType", "durationMonths", "startDate", "purpose", "notes", "status",
  ];

  const loan = await Loan.findOne({ _id: req.params.id, lender: req.user._id });
  if (!loan) return next(new AppError("Loan not found", 404));

  if (req.body.borrower) {
    const borrower = await Borrower.findOne({ _id: req.body.borrower, lender: req.user._id });
    if (!borrower) return next(new AppError("Borrower not found", 404));
  }

  allowed.forEach((k) => { if (req.body[k] !== undefined) loan[k] = req.body[k]; });
  await loan.save();
  await loan.populate("borrower", "name phone email");

  success(res, loan, "Loan updated");
};

export const closeLoan = async (req, res, next) => {
  const loan = await Loan.findOne({ _id: req.params.id, lender: req.user._id });
  if (!loan) return next(new AppError("Loan not found", 404));
  loan.status = "closed";
  await loan.save();
  success(res, loan, "Loan closed");
};

export const deleteLoan = async (req, res, next) => {
  const loan = await Loan.findOne({ _id: req.params.id, lender: req.user._id });
  if (!loan) return next(new AppError("Loan not found", 404));

  await Repayment.deleteMany({ loan: loan._id });
  await loan.deleteOne();
  success(res, null, "Loan deleted");
};
