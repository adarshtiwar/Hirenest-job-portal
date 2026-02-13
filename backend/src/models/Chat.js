import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Company"],
    },
    content: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "readByModel",
      },
    ],
    readByModel: {
      type: String,
      enum: ["User", "Company"],
    },
  },
  { timestamps: true }
);

const chatSchema = mongoose.Schema(
  {
    participants: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "participants.model",
        },
        model: {
          type: String,
          enum: ["User", "Company"],
        },
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;