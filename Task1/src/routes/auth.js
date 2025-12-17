import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const credentialsSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6),
});

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const { email, password } = parsed.data;

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "Email already in use" });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash });
        const token = signToken(user._id);

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ message: "Email already in use" });
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const { email, password } = parsed.data;

    try {
        const user = await User.findOne({ email });
        if (!user?.passwordHash || typeof user.passwordHash !== "string" || !user.passwordHash.length) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.passwordHash);
        } catch {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!passwordMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = signToken(user._id);
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.user.id).select("email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, email: user.email });
});

export default router;
