import express from "express";
import { extractSkills, getJobRecommendations } from "../controllers/resumeController.js";

const router = express.Router();

// Extract skills from resume
router.get("/extract-skills/:userId", extractSkills);

// Get job recommendations based on skills
router.get("/recommendations/:userId", getJobRecommendations);

export default router;