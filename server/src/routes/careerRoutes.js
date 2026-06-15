import { Router } from "express";
import {
  getCareers,
  getCareerById,
  searchCareers,
  getRelatedCareers,
  compareCareers,
  saveCareer,
  unsaveCareer,
  getSavedCareers,
} from "../controllers/careerController.js";

const router = Router();

router.get("/", getCareers);
router.get("/search/:query", searchCareers);
router.get("/saved/:userId", getSavedCareers);
router.post("/compare", compareCareers);
router.get("/:id", getCareerById);
router.get("/:id/related", getRelatedCareers);
router.post("/:id/save", saveCareer);
router.delete("/:id/save", unsaveCareer);

export default router;
