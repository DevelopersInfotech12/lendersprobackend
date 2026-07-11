import express from "express";
import {
  createBorrower, getBorrowers, getBorrower, getBorrowerProfile, updateBorrower, deleteBorrower,
} from "../controllers/borrowerController.js";
import { borrowerValidator } from "../middleware/validators/borrowerValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getBorrowers)
  .post(borrowerValidator, validate, createBorrower);

router.get("/:id/profile", getBorrowerProfile);

router.route("/:id")
  .get(getBorrower)
  .put(borrowerValidator, validate, updateBorrower)
  .delete(deleteBorrower);

export default router;
