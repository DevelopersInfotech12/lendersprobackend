import Borrower from "../models/Borrower.js";
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";
import { autoMarkDefaults } from "../utils/loanStatus.js";

export const createBorrower = async (req, res) => {
  const borrower = await Borrower.create({ ...req.body, lender: req.user._id });
  success(res, borrower, "Borrower created", 201);
};

export const getBorrowers = async (req, res) => {
  const { search, isActive } = req.query;
  const filter = { lender: req.user._id };
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { phone: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const borrowers = await Borrower.find(filter).sort("-createdAt");
  success(res, borrowers, "Borrowers fetched");
};

export const getBorrower = async (req, res, next) => {
  const borrower = await Borrower.findOne({ _id: req.params.id, lender: req.user._id });
  if (!borrower) return next(new AppError("Borrower not found", 404));
  success(res, borrower, "Borrower fetched");
};

export const updateBorrower = async (req, res, next) => {
  const borrower = await Borrower.findOneAndUpdate(
    { _id: req.params.id, lender: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!borrower) return next(new AppError("Borrower not found", 404));
  success(res, borrower, "Borrower updated");
};

// GET /borrowers/:id/profile — full 360° view of a borrower: their loans,
// every repayment made against those loans, and rolled-up stats. Powers
// the borrower details page on the frontend.
export const getBorrowerProfile = async (req, res, next) => {
  const borrower = await Borrower.findOne({ _id: req.params.id, lender: req.user._id });
  if (!borrower) return next(new AppError("Borrower not found", 404));

  await autoMarkDefaults(req.user._id);

  const loans = await Loan.find({ borrower: borrower._id, lender: req.user._id }).sort("-createdAt");
  const loanIds = loans.map((l) => l._id);

  const repayments = await Repayment.find({ loan: { $in: loanIds } })
    .populate("loan", "principalAmount interestRate status")
    .sort("-paymentDate");

  const totalPrincipal   = loans.reduce((s, l) => s + l.principalAmount, 0);
  const totalRepayable   = loans.reduce((s, l) => s + l.totalRepayable, 0);
  const totalPaid        = loans.reduce((s, l) => s + l.totalPaid, 0);
  const totalOutstanding = Math.max(totalRepayable - totalPaid, 0);

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const overdueLoans  = loans.filter((l) => l.status !== "closed" && l.nextDueDate && l.nextDueDate < now);
  const upcomingLoans = loans.filter((l) => l.status === "active" && l.nextDueDate && l.nextDueDate >= now && l.nextDueDate <= weekAhead);

  const stats = {
    totalPrincipal,
    totalRepayable,
    totalPaid,
    totalOutstanding,
    loanCount: loans.length,
    activeLoans: loans.filter((l) => l.status === "active").length,
    closedLoans: loans.filter((l) => l.status === "closed").length,
    defaultedLoans: loans.filter((l) => l.status === "defaulted").length,
    overdueCount: overdueLoans.length,
    upcomingCount: upcomingLoans.length,
  };

  success(res, { borrower, loans, repayments, stats, overdueLoans, upcomingLoans }, "Borrower profile fetched");
};

export const deleteBorrower = async (req, res, next) => {
  const borrower = await Borrower.findOne({ _id: req.params.id, lender: req.user._id });
  if (!borrower) return next(new AppError("Borrower not found", 404));

  const hasLoans = await Loan.exists({ borrower: borrower._id });
  if (hasLoans) return next(new AppError("Cannot delete borrower with existing loans", 400));

  await borrower.deleteOne();
  success(res, null, "Borrower deleted");
};
