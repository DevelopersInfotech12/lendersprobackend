import { body } from "express-validator";

export const repaymentValidator = [
  body("loan").notEmpty().withMessage("Loan ID is required"),
  body("amount").isFloat({ min: 1 }).withMessage("Amount must be > 0"),
  body("paymentDate").optional().isISO8601().withMessage("Valid payment date required"),
  body("paymentMode").optional().isIn(["cash", "upi", "bank_transfer", "cheque", "other"]),
];
