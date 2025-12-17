import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import imageKitRoutes from "./routes/imageKit.js";
import videoRoutes from "./routes/videos.js";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/imagekit", imageKitRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("AI chat + Video Uploading app!");
});


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(4000, () => console.log("Server running on 4000"));
    })
    .catch(console.error);
