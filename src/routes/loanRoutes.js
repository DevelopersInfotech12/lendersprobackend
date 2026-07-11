import express from "express";
import {
  createLoan, getLoans, getLoan, getRecurringLoans, updateLoan, closeLoan, deleteLoan,
} from "../controllers/loanController.js";
import { loanValidator } from "../middleware/validators/loanValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getLoans)
  .post(loanValidator, validate, createLoan);

router.get("/recurring/due", getRecurringLoans);

router.route("/:id")
  .get(getLoan)
  .put(updateLoan)
  .delete(deleteLoan);

router.patch("/:id/close", closeLoan);

export default router;
