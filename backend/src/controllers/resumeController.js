import User from "../models/User.js";
import Job from "../models/Job.js";
import natural from "natural";
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

const skillAliases = {
  "node.js": "node",
  nodejs: "node",
  "react.js": "react",
  reactjs: "react",
  "next.js": "nextjs",
  next: "nextjs",
  "vue.js": "vue",
  vuejs: "vue",
  js: "javascript",
  ts: "typescript",
  "tailwindcss": "tailwind",
  "express.js": "express",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
};

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\w\s#+./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractSkillsFromText = (rawText = "") => {
  const lowerRawText = (rawText || "").toString().toLowerCase();
  const normalizedText = normalizeText(rawText);
  if (!normalizedText) return [];

  const extractedSkills = [];
  const processedTokens = new Set();
  const tokens = tokenizer.tokenize(normalizedText);

  tokens.forEach((token) => {
    const stemmedToken = stemmer.stem(token);

    if (token.length > 2 && !processedTokens.has(stemmedToken)) {
      processedTokens.add(stemmedToken);

      const matchedSkill = techSkills.find(
        (skill) =>
          skill === token ||
          stemmer.stem(skill.replace(/\s+/g, "")) === stemmedToken ||
          stemmer.stem(skill) === stemmedToken
      );

      if (matchedSkill && !extractedSkills.includes(matchedSkill)) {
        extractedSkills.push(matchedSkill);
      }
    }
  });

  techSkills.forEach((skill) => {
    if (
      skill.includes(" ") &&
      normalizedText.includes(skill) &&
      !extractedSkills.includes(skill)
    ) {
      extractedSkills.push(skill);
    }
  });

  const searchableText = ` ${lowerRawText} ${normalizedText} `;

  Object.entries(skillAliases).forEach(([alias, canonicalSkill]) => {
    const aliasRegex = new RegExp(
      `(^|[^a-z0-9+#])${escapeRegExp(alias)}(?=$|[^a-z0-9+#])`,
      "i"
    );
    if (
      aliasRegex.test(searchableText) &&
      !extractedSkills.includes(canonicalSkill)
    ) {
      extractedSkills.push(canonicalSkill);
    }
  });

  return extractedSkills;
};

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
    
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      return res.status(400).json({
        message: "Could not read resume file",
      });
    }
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const cleanUrl = resumeUrl.split("?")[0].toLowerCase();

    if (cleanUrl.endsWith(".pdf") || contentType.includes("application/pdf")) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else {
      const rawText = await response.text();
      if (cleanUrl.endsWith(".html") || contentType.includes("text/html")) {
        resumeText = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      } else {
        resumeText = rawText;
      }
    }
    
    // Extract and store normalized skills on user
    const extractedSkills = extractSkillsFromText(resumeText);
    
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
      if (!user.resume) {
        return res.status(400).json({ message: "No skills found for this user" });
      }

      try {
        const resumeResponse = await fetch(user.resume);
        if (resumeResponse.ok) {
          const resumeRawText = await resumeResponse.text();
          user.skills = extractSkillsFromText(resumeRawText);
          await user.save();
        }
      } catch (error) {
        console.error("Skill hydration from resume failed:", error);
      }
    }

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({ message: "No skills found for this user" });
    }
    
    // Get all visible jobs with company data
    const allJobs = await Job.find({ visible: true }).populate("companyId", "name image");
    
    // Calculate job match scores
    const userSkillsLower = user.skills.map((skill) => skill.toLowerCase());
    const jobMatches = allJobs.map((job) => {
      const inferredSkills = extractSkillsFromText(
        `${job.title || ""} ${job.category || ""} ${job.description || ""}`
      );
      const jobSkills = Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : inferredSkills;
      const jobSkillsLower = jobSkills.map((skill) => skill.toLowerCase());
      
      // Count matching skills
      let matchCount = 0;
      userSkillsLower.forEach((userSkill) => {
        if (
          jobSkillsLower.some(
            (jobSkill) => jobSkill.includes(userSkill) || userSkill.includes(jobSkill)
          )
        ) {
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
        matchCount,
        matchedSkillNames: user.skills.filter((userSkill) =>
          jobSkillsLower.some(
            (jobSkill) =>
              jobSkill.includes(userSkill.toLowerCase()) ||
              userSkill.toLowerCase().includes(jobSkill)
          )
        ),
      };
    });
    
    // Sort by match percentage (descending)
    jobMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Return top recommendations
    const recommendations = jobMatches
      .slice(0, 10)
      .map((match) => ({
      ...match.job.toObject(),
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchCount,
      matchedSkillNames: match.matchedSkillNames,
    }));
    
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    res.status(500).json({ message: "Failed to get job recommendations", error: error.message });
  }
};
