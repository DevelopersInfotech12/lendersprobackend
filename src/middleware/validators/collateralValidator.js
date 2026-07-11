import { body } from "express-validator";

export const collateralValidator = [
  body("borrower").notEmpty().withMessage("Borrower is required"),
  body("assetType").isIn(["property", "gold_jewelry", "vehicle", "electronics", "document", "other"]).withMessage("Invalid asset type"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("estimatedValue").isFloat({ min: 0 }).withMessage("Estimated value must be >= 0"),
  body("image").optional({ nullable: true, checkFalsy: true }).isString().withMessage("Invalid image data"),
  body("depositDate").optional().isISO8601(),
];
