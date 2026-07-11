import Guarantor from "../models/Guarantor.js";
import Loan from "../models/Loan.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";

export const createGuarantor = async (req, res, next) => {
  const loan = await Loan.findOne({ _id: req.body.loan, lender: req.user._id });
  if (!loan) return next(new AppError("Loan not found", 404));

  const guarantor = await Guarantor.create({ ...req.body, borrower: loan.borrower, lender: req.user._id });
  await guarantor.populate("loan", "principalAmount status");
  success(res, guarantor, "Guarantor added", 201);
};

export const getGuarantors = async (req, res) => {
  const { loan, borrower } = req.query;
  const filter = { lender: req.user._id };
  if (loan) filter.loan = loan;
  if (borrower) filter.borrower = borrower;

  const guarantors = await Guarantor.find(filter)
    .populate("loan", "principalAmount status")
    .populate("borrower", "name phone")
    .sort("-createdAt");
  success(res, guarantors, "Guarantors fetched");
};

export const getGuarantor = async (req, res, next) => {
  const guarantor = await Guarantor.findOne({ _id: req.params.id, lender: req.user._id })
    .populate("loan", "principalAmount status")
    .populate("borrower", "name phone");
  if (!guarantor) return next(new AppError("Guarantor not found", 404));
  success(res, guarantor, "Guarantor fetched");
};

export const updateGuarantor = async (req, res, next) => {
  const guarantor = await Guarantor.findOneAndUpdate(
    { _id: req.params.id, lender: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!guarantor) return next(new AppError("Guarantor not found", 404));
  success(res, guarantor, "Guarantor updated");
};

export const deleteGuarantor = async (req, res, next) => {
  const guarantor = await Guarantor.findOne({ _id: req.params.id, lender: req.user._id });
  if (!guarantor) return next(new AppError("Guarantor not found", 404));
  await guarantor.deleteOne();
  success(res, null, "Guarantor deleted");
};
