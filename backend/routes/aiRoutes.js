import express from "express";
import { askGemini } from "../services/geminiService.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Submit question to Gemini AI Copilot
 * @access  Public
 */
router.post("/chat", async (req, res) => {
  const { prompt, message, history, language } = req.body;
  const userPrompt = prompt || message;

  if (!userPrompt || typeof userPrompt !== "string" || !userPrompt.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid prompt or message."
    });
  }

  try {
    const result = await askGemini({
      prompt: userPrompt.trim(),
      history: Array.isArray(history) ? history : [],
      language: language || "en"
    });

    return res.json({
      success: true,
      reply: result.text,
      model: result.model
    });
  } catch (error) {
    logger.error("AI chat error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI response",
      fallback: true
    });
  }
});

/**
 * @route   GET /api/ai/status
 * @desc    Check Gemini AI service status
 * @access  Public
 */
router.get("/status", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return res.json({
    success: true,
    active: hasKey,
    provider: "Google Gemini AI Studio",
    model: "gemini-3.1-flash-lite"
  });
});

export default router;
