import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },

        fileId: { type: String, required: true },
        url: { type: String, required: true },
        name: { type: String },
        mime: { type: String },
        size: { type: Number },
    },
    { timestamps: true }
);

export const Video = mongoose.model("Video", VideoSchema);
