import { Router } from "express";
import {
  upsertStudent,
  checkEligibility,
  getEligibilityHistory,
  getTrendData,
} from "../controllers/eligibilityController.js";

const router = Router();

router.post("/student", upsertStudent);
router.post("/check-eligibility", checkEligibility);
router.get("/history/:userId", getEligibilityHistory);
router.get("/trends", getTrendData);

export default router;
