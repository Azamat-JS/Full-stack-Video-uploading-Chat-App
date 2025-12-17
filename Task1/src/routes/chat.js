import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { ChatSession } from "../models/ChatSession.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { openai } from "../llm/openAIClient.js";

const router = express.Router();

router.post("/sessions", requireAuth, async (req, res) => {
    const session = await ChatSession.create({ userId: req.user.id, title: req.body?.title || "New chat" });
    res.json(session);
});

router.get("/sessions", requireAuth, async (req, res) => {
    const sessions = await ChatSession.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(sessions);
});

router.get("/sessions/:id/messages", requireAuth, async (req, res) => {
    const messages = await ChatMessage.find({ sessionId: req.params.id, userId: req.user.id }).sort({ createdAt: 1 });
    res.json(messages);
});

router.post("/sessions/:id/messages", requireAuth, async (req, res) => {
    const content = String(req.body?.content || "").trim();
    if (!content) return res.status(400).json({ message: "content is required" });

    const userMsg = await ChatMessage.create({
        sessionId: req.params.id,
        userId: req.user.id,
        role: "user",
        content,
    });

    const history = await ChatMessage.find({ sessionId: req.params.id, userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20);

    const transcript = history
        .reverse()
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

    const resp = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: `You are a helpful assistant.\n\n${transcript}\nAssistant:`,
    });

    const assistantText =
        resp.output_text?.trim() || "Sorry — I couldn’t generate a response.";

    const assistantMsg = await ChatMessage.create({
        sessionId: req.params.id,
        userId: req.user.id,
        role: "assistant",
        content: assistantText,
    });

    await ChatSession.updateOne({ _id: req.params.id, userId: req.user.id }, { $set: { updatedAt: new Date() } });

    res.json({ user: userMsg, assistant: assistantMsg });
});

export default router;
