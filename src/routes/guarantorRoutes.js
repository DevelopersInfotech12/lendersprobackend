import express from "express";
import {
  createGuarantor, getGuarantors, getGuarantor, updateGuarantor, deleteGuarantor,
} from "../controllers/guarantorController.js";
import { guarantorValidator } from "../middleware/validators/guarantorValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getGuarantors)
  .post(guarantorValidator, validate, createGuarantor);

router.route("/:id")
  .get(getGuarantor)
  .put(updateGuarantor)
  .delete(deleteGuarantor);

export default router;
