import { body } from "express-validator";

export const guarantorValidator = [
  body("loan").notEmpty().withMessage("Loan is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("idType").optional().isIn(["aadhaar", "pan", "passport", "voter_id", "driving_license", "other"]),
];
