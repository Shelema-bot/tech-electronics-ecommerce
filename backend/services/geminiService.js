import axios from "axios";
import logger from "../utils/logger.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const PRIMARY_MODEL = "gemini-3.1-flash-lite";

const STORE_SYSTEM_INSTRUCTION = `
You are the official AI Copilot and Intelligent Shopping Assistant for "Tech & Electronic E-Commerce", Ethiopia's premier tech and electronics shopping platform.

Store & System Knowledge:
• Founder & Visionary: Shelema Ageri (sole founder and system architect).
• Core Categories: Laptops & Computers, Smartphones, Gaming Consoles & Accessories, Smart Watches, Drones, Digital Cameras, Headphones & Audio, Networking Equipment, and Smart Accessories.
• Currencies: Ethiopian Birr (ETB - primary platform currency), US Dollar ($ USD), Euro (€ EUR).
• Payment Methods:
  - Telebirr (Quick digital transfer)
  - Commercial Bank of Ethiopia (CBE Birr & direct bank account transfer)
  - Bank of Abyssinia (BOA)
  - Awash Bank
  - Chapa Gateway (Instant credit/debit card & mobile wallet processing)
  - Cash on Delivery (COD for eligible local deliveries)
• Payment Verification Workflow:
  - When customers choose a manual bank or mobile transfer (Telebirr, CBE, BOA, Awash), they complete the transfer, enter their transaction reference (txRef), and upload a receipt screenshot during checkout.
  - The Cashier / Finance department verifies the transaction on the admin dashboard and marks the order as Paid.
  - The Delivery department then fulfills and delivers the order.
• Staff Roles & Permissions (RBAC):
  - Owner / SuperAdmin: Shelema Ageri (full system authority, user management, staff meetings scheduling).
  - Admin: Product management, category control, orders & customer support.
  - Cashier / Finance: Payment verification, transaction reconciliation, seller fee management.
  - Delivery: Order pickup, delivery tracking, delivery confirmation.
  - WebAppManager: Frontend/UI deals, banners, and store layout.
  - Seller: Storefront inventory, seller product submissions (pending approval).
• Staff Video Meetings: Owner Shelema Ageri can schedule staff meetings; staff members can join interactive video meeting rooms directly in the admin portal.
• Contact Info: Phone: +251 974 007 772, Email: shelemaagari@gmail.com, Location: Addis Ababa, Ethiopia.

Language & Style:
• You are completely fluent in English, Amharic (አማርኛ), and Afan Oromo (Afaan Oromoo).
• Always respond in the SAME language that the user asks their question in (or the specified target language).
• Be polite, professional, concise, and helpful. Use clean Markdown (bold headings, bullet points, and code tags where appropriate).
`;

/**
 * Ask Google Gemini API for an intelligent completion
 * @param {Object} params
 * @param {string} params.prompt - Current user question
 * @param {Array}  [params.history] - Array of previous messages [{ sender: "user"|"bot", text: string }]
 * @param {string} [params.language] - Current language code ('en', 'am', 'om')
 * @returns {Promise<{ success: boolean, text: string, model: string }>}
 */
export async function askGemini({ prompt, history = [], language = "en" }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in backend environment");
  }

  // Format contents array for Google Generative Language API
  const contents = [];

  // Add previous conversational context (last 6 turns for brevity & speed)
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  for (const item of recentHistory) {
    if (item.sender === "user" && item.text) {
      contents.push({ role: "user", parts: [{ text: item.text }] });
    } else if (item.sender === "bot" && item.text) {
      contents.push({ role: "model", parts: [{ text: item.text }] });
    }
  }

  // Append current prompt with explicit language enforcement
  let promptText = prompt;
  if (language === "am") {
    promptText += " (እባክዎን በአማርኛ ቋንቋ አጭርና ግልጽ መልስ ይስጡ)";
  } else if (language === "om") {
    promptText += " (Mee Afaan Oromootiin gabaabinaan deebisi)";
  }
  contents.push({ role: "user", parts: [{ text: promptText }] });

  const url = `${GEMINI_API_BASE}/${PRIMARY_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: STORE_SYSTEM_INSTRUCTION }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.95
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response received from Gemini API");
    }

    return {
      success: true,
      text: text.trim(),
      model: PRIMARY_MODEL
    };
  } catch (error) {
    const status = error.response?.status;
    const errData = error.response?.data;
    logger.warn(`Gemini API error [${status}]: ${errData?.error?.message || error.message}`);
    throw error;
  }
}
