import { Router } from "express";
import {
  getQuestions,
  submitQuiz,
  getQuizHistory,
  getQuizResultById,
} from "../controllers/quizController.js";

const router = Router();

router.get("/questions", getQuestions);
router.post("/submit", submitQuiz);
router.get("/history/:userId", getQuizHistory);
router.get("/result/:id", getQuizResultById);

export default router;
