import express from "express";
import {
  analyzeResume,
  extractSkills,
  getJobRecommendations,
} from "../controllers/resumeController.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// Extract skills from resume
router.get("/extract-skills/:userId", extractSkills);

// Analyze the logged-in user's saved resume
router.post("/analyze", userAuthMiddleware, analyzeResume);

// Get job recommendations based on skills
router.get("/recommendations/:userId", getJobRecommendations);

export default router;
