import { Router } from "express";
import { recommendAlternatives } from "../controllers/recommendationController.js";

const router = Router();

router.post("/alternatives", recommendAlternatives);

export default router;
