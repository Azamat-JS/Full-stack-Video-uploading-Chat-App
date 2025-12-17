import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import imageKitRoutes from "./routes/imageKit.js";
import videoRoutes from "./routes/videos.js";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        await connectDB();
        res.status(200).json({
            status: "ok",
            db: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            db: "disconnected",
        });
    }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/imagekit", imageKitRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/chat", chatRoutes);

// Root route is optional (can keep)
app.get("/", (req, res) => {
    res.send("AI chat + Video Uploading app!");
});

export default app;
