import express from "express";
import { randomBytes, createHmac } from "crypto";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/auth", requireAuth, (req, res) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    if (!privateKey) return res.status(500).json({ message: "ImageKit private key missing" });

    const token = randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

    res.json({ token, expire, signature });
});

export default router;
