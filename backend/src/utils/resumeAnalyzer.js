import { readFile } from "fs/promises";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const techSkills = [
  "javascript",
  "react",
  "node",
  "express",
  "mongodb",
  "sql",
  "python",
  "java",
  "c++",
  "c#",
  "typescript",
  "html",
  "css",
  "tailwind",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "git",
  "rest",
  "graphql",
  "redis",
  "linux",
  "machine learning",
  "data science",
  "figma",
  "ui",
  "ux",
];

const aliases = {
  "node.js": "node",
  nodejs: "node",
  "react.js": "react",
  reactjs: "react",
  "next.js": "nextjs",
  js: "javascript",
  ts: "typescript",
  "tailwindcss": "tailwind",
  postgres: "sql",
  postgresql: "sql",
  mysql: "sql",
};

const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\w\s#+./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractSkillsFromText = (rawText = "") => {
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

  Object.entries(aliases).forEach(([alias, canonicalSkill]) => {
    if (
      (normalizedText.includes(alias) || lowerRawText.includes(alias)) &&
      !extractedSkills.includes(canonicalSkill)
    ) {
      extractedSkills.push(canonicalSkill);
    }
  });

  return extractedSkills;
};

const detectSections = (rawText = "") => {
  const text = normalizeText(rawText);
  const has = (pattern) => pattern.test(text);
  return {
    contact: has(/\b(email|phone|mobile|contact|linkedin)\b/),
    summary: has(/\b(summary|objective|profile)\b/),
    experience: has(/\b(experience|employment|work history)\b/),
    education: has(/\b(education|university|college|degree)\b/),
    projects: has(/\b(projects|portfolio|case study)\b/),
    skills: has(/\b(skills|technical skills|technologies)\b/),
  };
};

export const calculateAtsFromText = (rawText = "") => {
  const normalized = normalizeText(rawText);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const skills = extractSkillsFromText(rawText);
  const sections = detectSections(rawText);

  let score = 0;
  const improvements = [];

  const presentSections = Object.values(sections).filter(Boolean).length;
  score += Math.round((presentSections / 6) * 40);
  if (!sections.summary) improvements.push("Add a short professional summary.");
  if (!sections.experience) improvements.push("Add clear work experience with impact.");
  if (!sections.education) improvements.push("Add education details.");
  if (!sections.skills) improvements.push("Add a dedicated skills section.");

  const skillsScore = Math.min(30, skills.length * 3);
  score += skillsScore;
  if (skills.length < 8) {
    improvements.push("Include more relevant technical and role-specific keywords.");
  }

  if (wordCount >= 250 && wordCount <= 900) {
    score += 15;
  } else if (wordCount >= 150 && wordCount < 250) {
    score += 8;
    improvements.push("Resume is short. Add more measurable achievements.");
  } else if (wordCount > 900) {
    score += 8;
    improvements.push("Resume is too long. Keep it concise and focused.");
  } else {
    improvements.push("Add more details to your resume content.");
  }

  const hasNumbers = /\b\d+%|\b\d+\+|\$\d+|\b\d+\b/.test(normalized);
  if (hasNumbers) {
    score += 15;
  } else {
    improvements.push("Add quantified achievements (%, numbers, outcomes).");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    improvements: improvements.slice(0, 5),
    skills,
    wordCount,
  };
};

const parsePdfFromBuffer = async (buffer) => {
  const pdf = await import("pdf-parse");
  const data = await pdf.default(buffer);
  return data.text || "";
};

export const extractTextFromLocalResume = async (filePath, mimeType = "", originalName = "") => {
  const lowerName = (originalName || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    const buffer = await readFile(filePath);
    return parsePdfFromBuffer(buffer);
  }

  const raw = await readFile(filePath, "utf8");
  if (lowerMime.includes("html") || lowerName.endsWith(".html")) {
    return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  return raw;
};
