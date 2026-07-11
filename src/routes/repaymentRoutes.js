import express from "express";
import { addRepayment, getRepayments, deleteRepayment } from "../controllers/repaymentController.js";
import { repaymentValidator } from "../middleware/validators/repaymentValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getRepayments)
  .post(repaymentValidator, validate, addRepayment);

router.delete("/:id", deleteRepayment);

export default router;
