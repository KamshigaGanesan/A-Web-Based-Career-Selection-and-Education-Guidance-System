import express from "express";
import { analyzeProfile, saveToken, saveAnalysis, getHistory, analyzeRepo, updateNotificationSettings, getNotificationList } from "../controllers/githubController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/analyzer", requireAuth, analyzeProfile);
router.post("/token", requireAuth, saveToken);
router.post("/save", requireAuth, saveAnalysis);
router.get("/history", requireAuth, getHistory);
router.get("/repo/:owner/:repo", requireAuth, analyzeRepo);
router.get("/notifications", requireAuth, getHistory); // We'll update this to a specific fetcher later or use history
router.get("/notifications/list", requireAuth, getNotificationList);
router.post("/notifications", requireAuth, updateNotificationSettings);

export default router;
