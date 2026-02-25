import { Request, Response } from "express";
import { generateAIResponse } from "../services/openai.service.js";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const reply = await generateAIResponse(message);
    res.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err.message || err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};
