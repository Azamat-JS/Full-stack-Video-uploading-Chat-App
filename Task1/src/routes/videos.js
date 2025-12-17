import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Video } from "../models/Video.js";

const router = express.Router();

const createVideoSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().default(""),
    fileId: z.string().min(1),
    url: z.string().url(),
    name: z.string().optional(),
    mime: z.string().optional(),
    size: z.number().optional(),
});

router.post("/", requireAuth, async (req, res) => {
    const parsed = createVideoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const doc = await Video.create({ userId: req.user.id, ...parsed.data });
    res.json(doc);
});

router.get("/", requireAuth, async (req, res) => {
    const list = await Video.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
});

router.delete("/:id", requireAuth, async (req, res) => {
    const deleted = await Video.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
});

export default router;
