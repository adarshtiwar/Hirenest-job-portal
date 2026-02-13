import User from "../models/User.js";
import Job from "../models/Job.js";
import natural from "natural";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
// Import pdf-parse dynamically to avoid initialization errors
const pdfParse = async (buffer) => {
  try {
    const pdf = await import('pdf-parse');
    return pdf.default(buffer);
  } catch (error) {
    console.error("Error loading pdf-parse:", error);
    return { text: "" };
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Natural NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common tech skills dictionary
const techSkills = [
  "javascript", "react", "node", "express", "mongodb", "sql", "python", "java", "c++", "c#",
  "php", "ruby", "swift", "kotlin", "flutter", "react native", "angular", "vue", "typescript",
  "html", "css", "sass", "less", "bootstrap", "tailwind", "jquery", "ajax", "json", "xml",
  "rest", "graphql", "api", "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git",
  "github", "gitlab", "bitbucket", "jira", "confluence", "agile", "scrum", "kanban", "devops",
  "ci/cd", "testing", "jest", "mocha", "chai", "selenium", "cypress", "postman", "swagger",
  "redis", "elasticsearch", "kafka", "rabbitmq", "nginx", "apache", "linux", "unix", "windows",
  "macos", "android", "ios", "mobile", "responsive", "pwa", "spa", "ssr", "nextjs", "gatsby",
  "webpack", "babel", "eslint", "prettier", "npm", "yarn", "figma", "sketch", "adobe xd",
  "photoshop", "illustrator", "ui", "ux", "design", "wireframe", "prototype", "accessibility",
  "seo", "analytics", "marketing", "content", "social media", "email", "crm", "erp", "saas",
  "paas", "iaas", "cloud", "serverless", "microservices", "architecture", "security", "authentication",
  "authorization", "oauth", "jwt", "encryption", "hashing", "blockchain", "cryptocurrency",
  "machine learning", "ai", "data science", "big data", "hadoop", "spark", "tableau", "power bi",
  "excel", "word", "powerpoint", "outlook", "office", "google docs", "sheets", "slides", "drive",
  "project management", "leadership", "communication", "teamwork", "problem solving", "critical thinking",
  "creativity", "time management", "organization", "multitasking", "prioritization", "negotiation",
  "presentation", "public speaking", "writing", "editing", "proofreading", "research", "analysis",
  "reporting", "budgeting", "forecasting", "planning", "strategy", "marketing", "sales", "customer service",
  "support", "training", "mentoring", "coaching", "consulting", "advising", "recruiting", "hiring",
  "onboarding", "performance", "evaluation", "feedback", "development", "growth", "learning",
  "education", "certification", "degree", "diploma", "license", "accreditation", "qualification"
];

// Extract skills from resume
export const extractSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.resume) {
      return res.status(400).json({ message: "No resume found for this user" });
    }
    
    // Get resume content
    let resumeText = "";
    const resumeUrl = user.resume;
    
    if (resumeUrl.endsWith('.pdf')) {
      // Handle PDF resume
      const response = await fetch(resumeUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (resumeUrl.endsWith('.html')) {
      // Handle HTML resume
      const response = await fetch(resumeUrl);
      const html = await response.text();
      // Simple HTML to text conversion (can be improved with a proper HTML parser)
      resumeText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      // Handle plain text resume
      const response = await fetch(resumeUrl);
      resumeText = await response.text();
    }
    
    // Tokenize and normalize text
    const tokens = tokenizer.tokenize(resumeText.toLowerCase());
    
    // Extract skills
    const extractedSkills = [];
    const processedTokens = new Set();
    
    // Process single tokens
    tokens.forEach(token => {
      const stemmedToken = stemmer.stem(token);
      
      if (token.length > 2 && !processedTokens.has(stemmedToken)) {
        processedTokens.add(stemmedToken);
        
        // Check if token is a known skill
        const matchedSkill = techSkills.find(skill => 
          skill === token || stemmer.stem(skill) === stemmedToken
        );
        
        if (matchedSkill && !extractedSkills.includes(matchedSkill)) {
          extractedSkills.push(matchedSkill);
        }
      }
    });
    
    // Process multi-word skills
    const resumeTextLower = resumeText.toLowerCase();
    techSkills.forEach(skill => {
      if (skill.includes(' ') && resumeTextLower.includes(skill) && !extractedSkills.includes(skill)) {
        extractedSkills.push(skill);
      }
    });
    
    // Update user with extracted skills
    user.skills = extractedSkills;
    await user.save();
    
    res.status(200).json({ skills: extractedSkills });
  } catch (error) {
    console.error("Error extracting skills:", error);
    res.status(500).json({ message: "Failed to extract skills", error: error.message });
  }
};

// Get job recommendations based on skills
export const getJobRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({ message: "No skills found for this user" });
    }
    
    // Get all active jobs
    const allJobs = await Job.find({ status: "active" }).populate("company", "companyName logo location");
    
    // Calculate job match scores
    const jobMatches = allJobs.map(job => {
      const jobSkills = job.skills || [];
      const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
      
      // Count matching skills
      let matchCount = 0;
      user.skills.forEach(userSkill => {
        if (jobSkillsLower.some(jobSkill => jobSkill.includes(userSkill) || userSkill.includes(jobSkill))) {
          matchCount++;
        }
      });
      
      // Calculate match percentage
      const matchPercentage = jobSkills.length > 0 
        ? Math.round((matchCount / jobSkills.length) * 100) 
        : 0;
      
      return {
        job,
        matchPercentage,
        matchCount
      };
    });
    
    // Sort by match percentage (descending)
    jobMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Return top recommendations
    const recommendations = jobMatches.slice(0, 10).map(match => ({
      ...match.job.toObject(),
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchCount
    }));
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    res.status(500).json({ message: "Failed to get job recommendations", error: error.message });
  }
};