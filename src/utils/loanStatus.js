import Loan from "../models/Loan.js";

// Any active loan whose nextDueDate has passed with no repayment
// recorded against it gets auto-flagged as defaulted.
export const autoMarkDefaults = async (lenderId) => {
  const now = new Date();
  await Loan.updateMany(
    { lender: lenderId, status: "active", nextDueDate: { $lt: now } },
    { $set: { status: "defaulted" } }
  );
};
