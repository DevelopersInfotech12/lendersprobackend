import { body } from "express-validator";

export const loanValidator = [
  body("borrower").notEmpty().withMessage("Borrower is required"),
  body("principalAmount").isFloat({ min: 1 }).withMessage("Principal must be > 0"),
  body("interestRate").isFloat({ min: 0 }).withMessage("Interest rate must be >= 0"),
  body("interestType").optional().isIn(["flat", "reducing"]),
  body("repaymentType").optional().isIn(["installment", "interest_only"]),
  body("durationMonths").isInt({ min: 1 }).withMessage("Duration must be at least 1 month"),
  body("startDate").isISO8601().withMessage("Valid start date required"),
];
