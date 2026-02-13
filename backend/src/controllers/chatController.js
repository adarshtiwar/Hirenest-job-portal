import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Company from "../models/Company.js";

// List all recruiters (companies)
export const listRecruiters = async (req, res) => {
  try {
    const recruiters = await Company.find({}, "name email image");
    return res.status(200).json(recruiters);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recruiters", error: error.message });
  }
};

// List all candidates (users)
export const listCandidates = async (req, res) => {
  try {
    const candidates = await User.find({}, "name email image");
    return res.status(200).json(candidates);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

// Get all chats for a user or company
export const getUserChats = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    const chats = await Chat.find({
      "participants": {
        $elemMatch: {
          id: userId,
          model: userType === "recruiter" ? "Company" : "User"
        }
      }
    })
    .populate("participants.id", userType === "recruiter" 
      ? "name email image" 
      : "name email image")
    .sort({ updatedAt: -1 });
    
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

// Get a single chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate("participants.id", "name companyName email image logo")
      .populate("jobId", "title");
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat", error: error.message });
  }
};

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { userId, userType, recipientId, recipientType, jobId } = req.body;
    
    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: {
        $all: [
          { $elemMatch: { id: userId, model: userType === "recruiter" ? "Company" : "User" } },
          { $elemMatch: { id: recipientId, model: recipientType === "recruiter" ? "Company" : "User" } }
        ]
      },
      ...(jobId && { jobId })
    });
    
    if (existingChat) {
      const populatedExisting = await Chat.findById(existingChat._id)
        .populate("participants.id", "name email image")
        .populate("jobId", "title");
      return res.status(200).json(populatedExisting);
    }
    
    // Create new chat
    const newChat = new Chat({
      participants: [
        { id: userId, model: userType === "recruiter" ? "Company" : "User" },
        { id: recipientId, model: recipientType === "recruiter" ? "Company" : "User" }
      ],
      messages: [],
      ...(jobId && { jobId })
    });
    
    const savedChat = await newChat.save();
    
    // Populate participant details
    const populatedChat = await Chat.findById(savedChat._id)
      .populate("participants.id", "name companyName email image logo")
      .populate("jobId", "title");
    
    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, senderModel, content } = req.body;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Add new message
    const newMessage = {
      sender: senderId,
      senderModel,
      content,
      readBy: [senderId],
      readByModel: senderModel
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    
    await chat.save();
    // Return the saved message with timestamps and _id
    const savedMessage = chat.messages[chat.messages.length - 1];
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId, userId, userModel } = req.body;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
        message.readByModel = userModel;
      }
    });
    
    await chat.save();
    
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark messages as read", error: error.message });
  }
};