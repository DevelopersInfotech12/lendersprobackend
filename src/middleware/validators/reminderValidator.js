import { body } from "express-validator";

export const reminderValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("dueDate").isISO8601().withMessage("Valid due date required"),
  body("type").optional().isIn(["call", "visit", "payment_followup", "document", "other"]),
];
