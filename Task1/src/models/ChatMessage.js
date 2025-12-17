import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
    {
        sessionId: { type: mongoose.Types.ObjectId, ref: "ChatSession", required: true, index: true },
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

export const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
