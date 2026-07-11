import Collateral from "../models/Collateral.js";
import Borrower from "../models/Borrower.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";

export const createCollateral = async (req, res, next) => {
  const borrower = await Borrower.findOne({ _id: req.body.borrower, lender: req.user._id });
  if (!borrower) return next(new AppError("Borrower not found", 404));

  const collateral = await Collateral.create({ ...req.body, lender: req.user._id });
  await collateral.populate("borrower", "name phone");
  success(res, collateral, "Collateral recorded", 201);
};

export const getCollaterals = async (req, res) => {
  const { borrower, loan, status } = req.query;
  const filter = { lender: req.user._id };
  if (borrower) filter.borrower = borrower;
  if (loan) filter.loan = loan;
  if (status) filter.status = status;

  const collaterals = await Collateral.find(filter)
    .populate("borrower", "name phone")
    .populate("loan", "principalAmount status")
    .sort("-createdAt");
  success(res, collaterals, "Collaterals fetched");
};

export const getCollateral = async (req, res, next) => {
  const collateral = await Collateral.findOne({ _id: req.params.id, lender: req.user._id })
    .populate("borrower", "name phone")
    .populate("loan", "principalAmount status");
  if (!collateral) return next(new AppError("Collateral not found", 404));
  success(res, collateral, "Collateral fetched");
};

export const updateCollateral = async (req, res, next) => {
  const collateral = await Collateral.findOneAndUpdate(
    { _id: req.params.id, lender: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate("borrower", "name phone");
  if (!collateral) return next(new AppError("Collateral not found", 404));
  success(res, collateral, "Collateral updated");
};

// PATCH /collaterals/:id/return — hand the asset back to the borrower
export const returnCollateral = async (req, res, next) => {
  const collateral = await Collateral.findOne({ _id: req.params.id, lender: req.user._id });
  if (!collateral) return next(new AppError("Collateral not found", 404));
  collateral.status = "returned";
  collateral.returnDate = new Date();
  await collateral.save();
  success(res, collateral, "Collateral marked as returned");
};

export const deleteCollateral = async (req, res, next) => {
  const collateral = await Collateral.findOne({ _id: req.params.id, lender: req.user._id });
  if (!collateral) return next(new AppError("Collateral not found", 404));
  await collateral.deleteOne();
  success(res, null, "Collateral deleted");
};
