import express from "express";
import {
  createReminder, getReminders, updateReminder, completeReminder, deleteReminder,
} from "../controllers/reminderController.js";
import { reminderValidator } from "../middleware/validators/reminderValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getReminders)
  .post(reminderValidator, validate, createReminder);

router.patch("/:id/done", completeReminder);

router.route("/:id")
  .put(updateReminder)
  .delete(deleteReminder);

export default router;
