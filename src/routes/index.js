import express from "express";
import { protect } from "../middleware/auth.js";
import authRoutes      from "./authRoutes.js";
import borrowerRoutes  from "./borrowerRoutes.js";
import loanRoutes      from "./loanRoutes.js";
import repaymentRoutes from "./repaymentRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import collateralRoutes from "./collateralRoutes.js";
import guarantorRoutes from "./guarantorRoutes.js";
import reminderRoutes from "./reminderRoutes.js";

const router = express.Router();

router.use("/auth",        authRoutes);
router.use("/borrowers",   protect, borrowerRoutes);
router.use("/loans",       protect, loanRoutes);
router.use("/repayments",  protect, repaymentRoutes);
router.use("/dashboard",   protect, dashboardRoutes);
router.use("/collaterals", protect, collateralRoutes);
router.use("/guarantors",  protect, guarantorRoutes);
router.use("/reminders",   protect, reminderRoutes);

export default router;
