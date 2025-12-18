import "dotenv/config";
import express from "express";

import { connectDB } from "./src/lib/db.js";

import imageKitRoutes from "./src/routes/imagekit.js";
import videoRoutes from "./src/routes/videos.js";
import chatRoutes from "./src/routes/chat.js";
import authRoutes from "./src/routes/auth.js";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
});
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

app.use("/api/auth", authRoutes);
app.use("/api/imagekit", imageKitRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("AI chat + Video Uploading app!");
});

export default app;
