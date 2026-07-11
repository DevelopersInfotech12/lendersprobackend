import express from "express";
import {
  createCollateral, getCollaterals, getCollateral, updateCollateral, returnCollateral, deleteCollateral,
} from "../controllers/collateralController.js";
import { collateralValidator } from "../middleware/validators/collateralValidator.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.route("/")
  .get(getCollaterals)
  .post(collateralValidator, validate, createCollateral);

router.route("/:id")
  .get(getCollateral)
  .put(updateCollateral)
  .delete(deleteCollateral);

router.patch("/:id/return", returnCollateral);

export default router;
