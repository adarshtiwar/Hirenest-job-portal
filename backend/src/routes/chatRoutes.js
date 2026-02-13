import express from "express";
import { 
  getUserChats, 
  getChatById, 
  createChat, 
  sendMessage, 
  markMessagesAsRead,
  listRecruiters,
  listCandidates
} from "../controllers/chatController.js";

const router = express.Router();

// Get all chats for a user
router.get("/user/:userId/:userType", getUserChats);

// List recruiters and candidates
router.get("/recruiters", listRecruiters);
router.get("/candidates", listCandidates);

// Get a single chat by ID
router.get("/:chatId", getChatById);

// Create a new chat
router.post("/", createChat);

// Send a message
router.post("/message", sendMessage);

// Mark messages as read
router.put("/read", markMessagesAsRead);

export default router;