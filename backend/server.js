import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./src/db/connectDB.js";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import resumeRoutes from "./src/routes/resumeRoutes.js";
import Cloudinary from "./src/utils/cloudinary.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(bodyParser.json());
app.use(cors());

connectDB();
Cloudinary();

app.get("/", (req, res) => res.send("api is working"));

app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/job", jobRoutes);


app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/resume", resumeRoutes);

let onlineUsers = new Map(); 


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  
  socket.on("user_online", (userId) => {
    if (!userId) return;

    onlineUsers.set(String(userId), socket.id);

    io.emit("online_users", Array.from(onlineUsers.keys()));

    console.log("Online Users:", Array.from(onlineUsers.keys()));
  });

  // Join chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // Send message
  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("receive_message", data);
  });

  // Typing
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user_typing", data);
  });

  // 🔴 Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🌐Server is running on port ${PORT}`));
