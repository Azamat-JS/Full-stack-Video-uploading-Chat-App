import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, default: "New chat" },
    },
    { timestamps: true }
);

export const ChatSession = mongoose.model("ChatSession", ChatSessionSchema);
