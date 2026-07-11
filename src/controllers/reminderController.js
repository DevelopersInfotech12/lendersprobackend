import Reminder from "../models/Reminder.js";
import AppError from "../utils/AppError.js";
import { success } from "../utils/apiResponse.js";

export const createReminder = async (req, res) => {
  const reminder = await Reminder.create({ ...req.body, lender: req.user._id });
  await reminder.populate("borrower", "name phone");
  success(res, reminder, "Reminder created", 201);
};

export const getReminders = async (req, res) => {
  const { status, borrower, loan } = req.query;
  const filter = { lender: req.user._id };
  if (status) filter.status = status;
  if (borrower) filter.borrower = borrower;
  if (loan) filter.loan = loan;

  const reminders = await Reminder.find(filter)
    .populate("borrower", "name phone")
    .populate("loan", "principalAmount status")
    .sort("dueDate");
  success(res, reminders, "Reminders fetched");
};

export const updateReminder = async (req, res, next) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, lender: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!reminder) return next(new AppError("Reminder not found", 404));
  success(res, reminder, "Reminder updated");
};

// PATCH /reminders/:id/done — mark a follow-up complete
export const completeReminder = async (req, res, next) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, lender: req.user._id },
    { status: "done" },
    { new: true }
  );
  if (!reminder) return next(new AppError("Reminder not found", 404));
  success(res, reminder, "Reminder marked done");
};

export const deleteReminder = async (req, res, next) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, lender: req.user._id });
  if (!reminder) return next(new AppError("Reminder not found", 404));
  await reminder.deleteOne();
  success(res, null, "Reminder deleted");
};
