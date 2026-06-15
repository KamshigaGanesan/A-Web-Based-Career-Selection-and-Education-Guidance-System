import { Router } from "express";
import {
  getAlternatives,
  getAlternativeById,
  getAlternativesByType,
  addReview,
} from "../controllers/alternativeController.js";

const router = Router();

router.get("/", getAlternatives);
router.get("/type/:type", getAlternativesByType);
router.get("/:id", getAlternativeById);
router.post("/:id/review", addReview);

export default router;
