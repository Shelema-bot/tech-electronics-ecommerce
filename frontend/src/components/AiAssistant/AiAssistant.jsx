import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePreference } from "../../context/PreferenceContext";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import {
  VscSparkle,
  VscTerminal,
  VscCode,
} from "react-icons/vsc";
import {
  FaTimes,
  FaPaperPlane,
  FaTrashAlt,
  FaMinus,
  FaShieldAlt,
  FaPaperclip,
  FaFileAlt,
  FaFileImage,
} from "react-icons/fa";
import "./AiAssistant.css";

// ── Multi-language Default Greetings & Quick Suggestion Chips ─────────────────
const GREETINGS = {
  en: "VS Code Tech Copilot active. ⚡ How can I assist with system architecture, registration, catalog specs, CBE/Telebirr manual payment verification, or RBAC permissions today?",
  am: "የቴክ ሲስተም AI ኮፓይለት ዝግጁ ነው። ⚡ በምዝገባ፣ በካታሎግ ዕቃዎች፣ በሲቢኢ/ቴሌብር ክፍያ ማረጋገጫ ወይም በሰራተኞች የስልጣን ደረጃዎች (RBAC) ላይ እንዴት ልርዳዎት?",
  om: "Tech System AI Copilot qophiidha. ⚡ Galmee, oomishaalee, kaffaltii Telebirr/CBE, ykn gahee hojjettootaa (RBAC) irratti akkamitti isin gargaaruu danda'a?",
};

const SUGGESTIONS = {
  en: [
    { label: "⚡ System Architecture Guide", query: "Explain the entire platform system architecture" },
    { label: "🔐 Register & JWT Login", query: "How does registration, login routing, and JWT auth work?" },
    { label: "🛒 How to Register & Buy", query: "How do I register and buy an item step by step?" },
    { label: "💳 Manual Payments (CBE / Telebirr)", query: "How do I pay with Telebirr, CBE Birr, BOA, or Awash Bank?" },
    { label: "📦 What Happens After Payment?", query: "What happens after I upload my payment receipt?" },
    { label: "🚚 Order & Delivery Logistics", query: "How does order tracking and delivery fulfillment work?" },
    { label: "👑 Staff Roles & RBAC", query: "What can each staff role do in the system?" },
    { label: "✨ Who Can Approve Sellers?", query: "Who can approve a new seller on this platform?" },
    { label: "🔥 Deals & Discounts", query: "How do discount pricing and strikethrough prices work?" },
    { label: "💻 Best Laptops Under 40K", query: "Show me best laptops under 40000 ETB" },
  ],
  am: [
    { label: "⚡ የሲስተም ሙሉ አወቃቀር", query: "የሲስተሙን ሙሉ አወቃቀርና የስራ ፍሰት አስረዳኝ" },
    { label: "🔐 የምዝገባና JWT መግቢያ", query: "የምዝገባና መግቢያ ሂደት እንዴት ይሰራል?" },
    { label: "🛒 የግዢ ደረጃዎች መመሪያ", query: "እንዴት ተመዝግቤ ዕቃ መግዛት እችላለሁ?" },
    { label: "💳 የባንክና ቴሌብር ክፍያ", query: "በቴሌብር፣ በሲቢኢ፣ በአቢሲኒያ ወይም በአዋሽ ባንክ እንዴት እከፍላለሁ?" },
    { label: "📦 ደረሰኝ ከላኩ በኋላ ምን ይሆናል?", query: "የክፍያ ደረሰኝ ከላኩ በኋላ ምን ይሆናል?" },
    { label: "🚚 የማድረሻና ትዕዛዝ ሂደት", query: "ማድረሻና ትዕዛዝ ክትትል እንዴት ይሰራል?" },
    { label: "👑 የሰራተኞች የስልጣን ደረጃ (RBAC)", query: "የሰራተኞች የስልጣን ደረጃና ሚናዎች ምንድናቸው?" },
    { label: "✨ ሻጭ ማጽደቅ የሚችለው ማነው?", query: "ሻጭ ማጽደቅ የሚችለው ማነው?" },
    { label: "🔥 ቅናሾችና ዋጋዎች", query: "የቅናሽ ዋጋና የተሰረዘው መደበኛ ዋጋ እንዴት ይሰራል?" },
    { label: "💻 ምርጥ ላፕቶፖች", query: "ከ40,000 ብር በታች ምርጥ ላፕቶፖችን አሳየኝ" },
  ],
  om: [
    { label: "⚡ Caasaa Sirnaa Guutuu", query: "Caasaa fi adeemsa sirnichaa guutuu naaf ibsaa" },
    { label: "🔐 Galmee fi JWT Seensa", query: "Adeemsi galmee fi seensaa akkamitti hojjeta?" },
    { label: "🛒 Adeemsa Bittaa", query: "Galmaa'ee akkamitti oomisha bituu danda'a?" },
    { label: "💳 Kaffaltii Baankii fi Telebirr", query: "Telebirr, CBE, Abisiiniyaa fi Awaashiin akkamitti kaffalama?" },
    { label: "📦 Nagahee Erga Feenee Booda?", query: "Nagahee kaffaltii erga feenee booda maaltu ta'a?" },
    { label: "🚚 Haala Geejjiba fi Ajaja", query: "Geejjibni fi hordoffiin ajajaa akkamitti raawwatama?" },
    { label: "👑 Gahee Hojjettootaa (RBAC)", query: "Gaheen hojjettootaa fi itti gaafatamummaan maali?" },
    { label: "✨ Eenyutu Gurgurtuu Mirkaneessa?", query: "Gurgurtuu haaraa eenyutu mirkaneessuu danda'a?" },
    { label: "🔥 Hir'ina Gatii", query: "Gatiin hir'ifamee fi gatiin duraanii akkamitti mul'ata?" },
    { label: "💻 Laaptooppii Gaarii", query: "Laaptooppii gatiin isaa 40000 gadi ta'e na agarsiisi" },
  ],
};

// ── Text Formatter Helper (Markdown Bold & Code Support) ──────────────────────
const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lIdx) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return <div key={lIdx} className="ai-empty-line" />;
    }
    const isBullet = trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ");
    const cleanLine = isBullet ? trimmedLine.slice(2) : trimmedLine;

    // Split on code tags `code` or **bold**
    const parts = cleanLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return (
      <div key={lIdx} className={isBullet ? "ai-bullet-line" : "ai-text-line"}>
        {isBullet && <span className="ai-bullet-dot">›</span>}
        <span className="ai-line-content">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return <code key={pIdx} className="ai-inline-code">{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </span>
      </div>
    );
  });
};

// ── Search & Natural Language Keywords Helper ─────────────────────────────────
const STOP_WORDS = new Set([
  "i", "want", "to", "buy", "a", "an", "the", "for", "looking", "show", "me", "give",
  "find", "get", "do", "you", "have", "any", "good", "best", "cheap", "please", "some",
  "need", "can", "is", "there", "what", "which", "are", "of", "with", "all", "in",
  "መግዛት", "እፈልጋለሁ", "አሳየኝ", "ስጠኝ", "ፈልግ", "የሚሸጥ", "አለ", "ምርጥ", "ቅናሽ", "ዋጋ",
  "bituu", "barbaada", "agarsiisi", "jira", "gaarii", "rakkaasa", "gatii"
]);

const KNOWN_BRANDS = [
  "apple", "macbook", "iphone", "ipad", "samsung", "galaxy", "hp", "dell",
  "lenovo", "thinkpad", "asus", "rog", "acer", "sony", "playstation", "ps5",
  "xbox", "nintendo", "dji", "canon", "nikon", "epson", "logitech", "anker",
  "bose", "jbl", "xiaomi", "redmi", "huawei", "infinix", "tecno", "google", "pixel"
];

const CAT_KEYWORD_MAP = {
  Laptops: ["laptop", "laptops", "notebook", "macbook", "computer", "pc", "core i", "ryzen", "ላፕቶፕ", "ኮምፒውተር", "laaptooppii"],
  Smartphones: ["phone", "phones", "smartphone", "smartphones", "iphone", "galaxy", "android", "mobile", "ስልክ", "ስማርትፎን", "ሞባይል", "bilbila", "moobaayilii"],
  Gaming: ["gaming", "game", "gamer", "playstation", "ps5", "xbox", "nintendo", "console", "rtx", "gpu", "ጌም", "ጌሚንግ", "geemii"],
  "Smart Watch": ["watch", "smartwatch", "applewatch", "fitbit", "band", "ሰዓት", "ስማርትሰዓት", "sa'aatii"],
  "Headphones & Audio": ["headphone", "headphones", "headset", "earphone", "earphones", "earbuds", "airpods", "speaker", "audio", "sound", "ድምጽ", "ሄድፎን", "ስፒከር", "hedfoonii", "sagalee"],
  Tablets: ["tablet", "tablets", "ipad", "tab", "ታብሌት", "አይፓድ", "taableetii"],
  Cameras: ["camera", "cameras", "dslr", "lens", "nikon", "canon", "ካሜራ", "kaameraa"],
  Drones: ["drone", "drones", "quadcopter", "uav", "dji", "ድሮን", "diroonii"],
  "Smart Accessories": ["accessory", "accessories", "charger", "cable", "adapter", "case", "powerbank", "mouse", "keyboard", "ቻርጀር", "ኬብል", "ፓወርባንክ", "chaarjerii", "keebilii"],
  Network: ["network", "router", "wifi", "switch", "modem", "ethernet", "ላን", "ዋይፋይ", "ሩተር", "raawutarii", "neetiwoorkii"],
  "Printers & Scanners": ["printer", "printers", "scanner", "scanners", "ink", "epson", "ፕሪንተር", "ስካነር", "piraantarii"],
  "Smart Home": ["smarthome", "smart home", "bulb", "alexa", "security camera", "ስማርትሆም"],
};

export default function AiAssistant() {
  const { t } = useTranslation();
  const { language } = usePreference();
  const location = useLocation();

  const [isOpen, setIsOpen]                   = useState(false);
  const [isMinimized, setIsMinimized]         = useState(false);
  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState("");
  const [isTyping, setIsTyping]               = useState(false);
  const [unreadCount, setUnreadCount]         = useState(0);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [user, setUser]                       = useState(null);
  const [attachedFile, setAttachedFile]       = useState(null);

  const messagesEndRef = useRef(null);
  const chatInputRef   = useRef(null);
  const fileInputRef   = useRef(null);

  const langCode = (language?.code || "en").toLowerCase();

  // Load authenticated user profile
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener("loginStatusChanged", loadUser);
    return () => window.removeEventListener("loginStatusChanged", loadUser);
  }, []);

  // Load products catalog once for recommendations
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const prods = Array.isArray(res.data)
          ? res.data
          : res.data?.products || [];
        setProductsCatalog(prods);
      })
      .catch(() => setProductsCatalog([]));
  }, []);

  // Welcome message when language changes
  useEffect(() => {
    const saved = sessionStorage.getItem("ai_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    const greetingText = GREETINGS[langCode] || GREETINGS.en;
    setMessages([
      {
        id: "msg_welcome",
        sender: "bot",
        text: greetingText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [langCode]);

  // Persist messages across routes
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("ai_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Hide on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setTimeout(() => chatInputRef.current?.focus(), 150);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    const greetingText = GREETINGS[langCode] || GREETINGS.en;
    const initial = [
      {
        id: `msg_${Date.now()}`,
        sender: "bot",
        text: greetingText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(initial);
    sessionStorage.setItem("ai_chat_messages", JSON.stringify(initial));
  };

  // ── File Attachment Handler ──
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const fileObj = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type,
      isImage,
      previewUrl: isImage ? URL.createObjectURL(file) : null,
    };
    setAttachedFile(fileObj);
    e.target.value = "";
  };

  const handleRemoveAttachment = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
  };

  // ── Comprehensive Knowledge & Architecture Reasoning Engine ────────────────
  const generateResponse = (userText, attachment) => {
    const q = userText.toLowerCase().trim();

    // Contextual response if attachment was included
    let fileNotice = "";
    if (attachment) {
      fileNotice = `📎 **Attachment Analyzed:** \`${attachment.name}\` (${attachment.size})\n`;
      if (
        attachment.isImage ||
        q.includes("receipt") ||
        q.includes("slip") ||
        q.includes("proof") ||
        q.includes("payment") ||
        q.includes("ደረሰኝ")
      ) {
        fileNotice += `• If this is your **bank transfer slip** (CBE, Telebirr, BOA, or Awash), ensure the \`txRef\` transaction number is clearly legible.\n• Remember to attach this file in the **Checkout** page (\`/checkout\`) when placing your manual order so Cashier / Finance can verify it!\n\n`;
      }
    }

    // ── 0A. Conversational Greetings ──────────────────────────────────────────
    const isGreeting =
      /^(hi|hello|hey|yo|howdy|selam|ሰላም|እንደምን|akkam|hallow|hola)\b/i.test(q) ||
      q.startsWith("good morning") ||
      q.startsWith("good afternoon") ||
      q.startsWith("good evening") ||
      q === "hi" || q === "hello" || q === "hey" || q === "ሰላም" || q === "akkam" || q === "selam";

    if (isGreeting) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}👋 **ሰላም! እንኳን ወደ ቴክ ኢ-ኮሜርስ (Tech & Electronic) በደህና መጡ!**
እኔ የሲስተሙ AI ረዳት (Tech Copilot) ነኝ። ዛሬ በምን ላግዝዎ እችላለሁ?
• **ምርቶችን መፈለግ:** ላፕቶፕ፣ ስልክ፣ ጌሚንግ ወይም የዋጋ ክልል ይጠይቁኝ (ምሳሌ፦ "ከ30000 ብር በታች ላፕቶፕ")
• **ክፍያና ደረሰኝ:** በቴሌብር፣ በሲቢኢ፣ በአቢሲኒያ ወይም በአዋሽ ባንክ ክፍያ ፈጽመው ደረሰኝ እንዴት እንደሚልኩ
• **ትዕዛዝ ክትትል:** የትዕዛዝዎን ሁኔታ ማወቅ
• **ምዝገባና መግቢያ:** መለያ መክፈትና መጠቀም
• **ስለ ሲስተሙ:** ስለ አሰራሩ ወይም ስለ አበልጻጊው (ሸለማ) ማወቅ`,
          links: [
            { label: "🛍️ ምርቶችን ይመልከቱ", to: "/products" },
            { label: "💳 ቼክአውት ገጽ", to: "/checkout" },
            { label: "📦 የእኔ ትዕዛዞች", to: "/my-orders" },
            { label: "✉️ ያግኙን", to: "/contact" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}👋 **Akkam! Baga nagaan gara Tech & Electronic dhuftan!**
Ani gargaaraa AI sirnichaa (Tech Copilot) dha. Har'a akkamitti isin gargaaruu danda'a?
• **Oomisha Barbaaduu:** Laaptooppii, bilbila, ykn gatii meeshaa na gaafadhaa (fkn: "laaptooppii 40000 gadani")
• **Kaffaltii fi Nagahee:** Telebirr, CBE, BOA fi Awash kaffaluu fi nagahee erguu
• **Ajaja Hordofuu:** Haala ajajni keessan irra jiru baruu
• **Galmee fi Seensa:** Herrega banachuu fi itti fayyadamuu
• **Waa'ee Sirnichaa:** Waa'ee sirna kanaa fi ijaaraa isaa (Shelema)`,
          links: [
            { label: "🛍️ Oomishaalee", to: "/products" },
            { label: "💳 Kaffaltii", to: "/checkout" },
            { label: "📦 Ajaja Koo", to: "/my-orders" },
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}👋 **Hello! Welcome to Tech & Electronic E-Commerce!**
I am your interactive AI Copilot. How can I assist you today?
• **Search Catalog:** Ask for any gadget, brand, or budget (e.g., *"Show me laptops under 40000 ETB"* or *"Samsung phones"*)
• **Manual Payments:** Learn how to pay via CBE Birr, Telebirr, Bank of Abyssinia, or Awash Bank and upload your receipt
• **Track Orders:** Check real-time shipping progression
• **Account & Auth:** Guidance on registering and logging in with JWT tokens
• **System Architecture:** Understand our RBAC roles or learn about the platform's Full-Stack Developer (Shelema Ageri)`,
        links: [
          { label: "🛍️ Browse Products", to: "/products" },
          { label: "💳 Checkout", to: "/checkout" },
          { label: "📦 Track Orders", to: "/my-orders" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // ── 0B. Full-Stack Developer & Creator Recognition (Shelema Ageri) ────────
    const isDeveloperQuery =
      q.includes("developer") ||
      q.includes("who developed") ||
      q.includes("who built") ||
      q.includes("who made") ||
      q.includes("who designed") ||
      q.includes("who created") ||
      q.includes("who is developer") ||
      q.includes("who is the developer") ||
      q.includes("who's the developer") ||
      q.includes("full stack") ||
      q.includes("fullstack") ||
      q.includes("shelema") ||
      q.includes("ageri") ||
      q.includes("ማነው የሰራው") ||
      q.includes("ማን ሰራው") ||
      q.includes("ደቨሎፐሩ ማነው") ||
      q.includes("ማነው ያዘጋጀው") ||
      q.includes("ማነው የፈጠረው") ||
      q.includes("eenyutu hojjete") ||
      q.includes("eenyutu ijaare");

    if (isDeveloperQuery) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}💻 **ስለ ሲስተም አበልጻጊ (Full-Stack Engineer):**
• **ሸለማ አገሪ (Shelema Ageri):** ይህንን የቴክ ኢ-ኮሜርስ ሙሉ ሲስተም (Full-Stack Architecture) ከመጀመሪያው እስከ መጨረሻው የገነባውና ያበለጸገው **ሸለማ አገሪ** (Founder & Full-Stack Developer) ነው።
• **የተገነቡ የሲስተም አወቃቀሮች:**
  - **ፈጣን የተጠቃሚ በይነገጽ (Frontend):** React.js እና CSS3 የተገነባ፣ በ3 ቋንቋዎች (እንግሊዝኛ፣ አማርኛ፣ አፋን ኦሮሞ) የሚሰራ ዘመናዊ ዩአይ።
  - **የደህንነት ሰርቨር (Backend API):** Node.js እና Express.js RESTful ማይክሮሰርቪስ ከ JWT የደህንነት ማረጋገጫ ጋር።
  - **ዳታቤዝ (Database Architecture):** MongoDB NoSQL የዳታ ሞዴሎች ለምርቶች፣ ለተጠቃሚዎች እና ለትዕዛዞች።
  - **የስልጣን እርከን ቁጥጥር (RBAC):** የሱፐር አድሚን (ሸለማ)፣ የካሺየር/ፋይናንስ፣ የዕቃ ክምችት፣ የማድረሻ እና የደንበኞች የስልጣን ድንበሮች።
  - **የክፍያ ማረጋገጫ:** የኢትዮጵያ ባንኮች (CBE Birr፣ Telebirr፣ አቢሲኒያ ባንክ፣ አዋሽ ባንክ) እና የ Chapa ፈጣን ክፍያ አሰራር።
• ሸለማ ሲስተሙን በሙሉ ብቻውን (Sole Full-Stack Developer) ያበለጸገው በመሆኑ በድረ-ገጹ ላይ ምንም ዓይነት ሌላ የውሸት ቡድን አባል የለም።`,
          links: [
            { label: "ℹ️ ስለ እኛ (About Page)", to: "/about" },
            { label: "✉️ ሸለማን ያግኙ", to: "/contact" },
            { label: "🛍️ ምርቶችን ይመልከቱ", to: "/products" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}💻 **Waa'ee Oomishaa fi Hojjataa Sirnichaa (Full-Stack Engineer):**
• **Shalamaa Aagerii (Shelema Ageri):** Sirna e-commerce guutuu kana (Full-Stack Architecture) jalqabaa hanga xumuraatti kan ijaaree fi hojjete **Shalamaa Aagerii** (Founder & Full-Stack Developer) dha.
• **Caasaalee Sirnichaa:**
  - **Frontend:** React.js fi CSS3 dhaan kan ijaarame, afaan 3n (Ingiliffa, Oromiffa, Amaariffa) kan hojjetu.
  - **Backend API:** Node.js fi Express.js tajaajila nageenya JWT qabu.
  - **Database:** MongoDB kuusaa daataa oomishaalee fi ajajaa.
  - **Eegumsa RBAC:** Aangoo Super Admin (Shelema), Cashier, Inventory, Delivery fi Customer qoodu.
  - **Kaffaltii:** Kaffaltii Baankii (CBE, BOA, Awash), Telebirr fi Chapa.
• Shalamaa Aagerii qofaan sirna kana guutummaatti waan ijaareef, gareen sobaa biraa sirna kana keessa hin jiru.`,
          links: [
            { label: "ℹ️ Waa'ee Keenya (About)", to: "/about" },
            { label: "✉️ Shelema Quunnamaa", to: "/contact" },
            { label: "🛍️ Oomisha Hunda", to: "/products" },
          ],
        };
      }
      return {
        text: `${fileNotice}💻 **Platform Creator & Full-Stack Software Engineer:**
• **Sole Full-Stack Architect (Shelema Ageri):** This entire e-commerce ecosystem was designed, architected, and developed end-to-end by **Shelema Ageri** (Founder & Lead Full-Stack Software Engineer).
• **Full-Stack Engineering Highlights:**
  - **Frontend UI/UX:** React.js single-page application with complete trilingual localization (English, Amharic, Afan Oromo) and responsive design.
  - **Backend Services:** Node.js & Express RESTful API microservices protected with cryptographic JWT authentication and CORS policies.
  - **Database Architecture:** MongoDB high-performance collections for products, orders, user accounts, categories, and audit logs.
  - **Enterprise RBAC:** Granular role-based authorization delineating Super Admin Shelema (exclusive seller approval authority), Cashier/Finance, Inventory Manager, Delivery, and Customers.
  - **Multi-Rail Payments:** Ethiopian localized manual banking workflows (CBE Birr, Telebirr, Bank of Abyssinia, Awash Bank) with slip upload verification alongside instant Chapa checkout.
• Having engineered the complete full-stack codebase independently, there are no third-party developer teams associated with this platform.`,
        links: [
          { label: "ℹ️ About Platform", to: "/about" },
          { label: "✉️ Contact Shelema", to: "/contact" },
          { label: "🛍️ Explore Products", to: "/products" },
        ],
      };
    }

    // ── 0C. Store Contact, Phone Number, Location & Hours ─────────────────────
    const isContactQuery =
      q.includes("contact") ||
      q.includes("phone") ||
      q.includes("telephone") ||
      q.includes("call") ||
      q.includes("address") ||
      q.includes("where are you") ||
      q.includes("location") ||
      q.includes("office") ||
      q.includes("telegram") ||
      q.includes("email") ||
      q.includes("ስልክ") ||
      q.includes("አድራሻ") ||
      q.includes("የት ነው ያላችሁት") ||
      q.includes("መደወል") ||
      q.includes("bilbila") ||
      q.includes("teessoo") ||
      q.includes("eessa jirtu");

    if (isContactQuery) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}📞 **የቴክ ኢ-ኮሜርስ አድራሻና የመገናኛ መስመሮች:**
• **ስልክ ቁጥር:** \`+251 974 007 772\` (በቀጥታ መደወል ይችላሉ)
• **ቴሌግራም ቻናል:** [\`@ijoolleeortodoksii\`](https://t.me/ijoolleeortodoksii)
• **ዋና ቢሮ አድራሻ:** አዲስ አበባ፣ ኢትዮጵያ (Addis Ababa, Ethiopia)
• **የስራ ሰዓት:** 24/7 የኦንላይን ደንበኞች ድጋፍ ክፍት ነው
• **ማድረሻ (Delivery):** አዲስ አበባ ውስጥ ከ1 እስከ 3 ቀናት፤ በመላው ኢትዮጵያ ደግሞ ከ3 እስከ 7 ቀናት በርዎ ድረስ እናደርሳለን!`,
          links: [
            { label: "✉️ መልእክት ይላኩልን", to: "/contact" },
            { label: "❓ በተደጋጋሚ የሚጠየቁ (FAQ)", to: "/faq" },
            { label: "🚚 የማድረሻ መረጃ", to: "/shipping-info" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}📞 **Teessoo fi Quunnamtii Tech E-Commerce:**
• **Lakkoofsa Bilbilaa:** \`+251 974 007 772\`
• **Telegram:** [\`@ijoolleeortodoksii\`](https://t.me/ijoolleeortodoksii)
• **Teessoo:** Finfinnee, Itoophiyaa (Addis Ababa, Ethiopia)
• **Sa'aatii Hojii:** Tajaajilli deeggarsa maamilaa sa'aatii 24/7 banaadha
• **Geejjiba:** Finfinnee keessatti guyyoota 1–3; kutaalee biyyaatti guyyoota 3–7 keessatti hulaa keessan ga'a!`,
          links: [
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
            { label: "❓ Gaaffilee Yeroo Baay'ee (FAQ)", to: "/faq" },
            { label: "🚚 Odeeffannoo Geejjibaa", to: "/shipping-info" },
          ],
        };
      }
      return {
        text: `${fileNotice}📞 **Contact & Location Information:**
• **Direct Phone:** \`+251 974 007 772\`
• **Telegram Community:** [\`@ijoolleeortodoksii\`](https://t.me/ijoolleeortodoksii)
• **Headquarters:** Addis Ababa, Ethiopia (Doorstep delivery nationwide)
• **Customer Support Hours:** 24/7 online technical & payment assistance
• **Delivery Speed:** 1–3 business days within Addis Ababa; 3–7 business days nationwide!`,
        links: [
          { label: "✉️ Send Message", to: "/contact" },
          { label: "❓ Help & FAQ", to: "/faq" },
          { label: "🚚 Shipping Details", to: "/shipping-info" },
        ],
      };
    }

    // ── 1. Who Can Approve Sellers & Exclusive Owner Verification ──────────────
    if (
      q.includes("who can approve") ||
      q.includes("approve seller") ||
      q.includes("seller approval") ||
      q.includes("approve new seller") ||
      q.includes("can i approve") ||
      q.includes("can admin approve seller") ||
      q.includes("who approves seller") ||
      q.includes("ሻጭ ማጽደቅ") ||
      q.includes("ሻጭ ማረጋገጫ") ||
      q.includes("gurgurtuu mirkaneessuu") ||
      q.includes("eenyutu gurgurtuu")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}👑 **ሻጮችን የማጽደቅ ስልጣንና መመሪያ:**
• **ዋና ባለቤት / ሱፐር አድሚን ብቻ (ሸለማ):** በሲስተማችን ውስጥ አዳዲስ ሻጮችን የመመርመርና የማጽደቅ ሙሉና ብቸኛ ስልጣን ያለው **ሱፐር አድሚን (ሸለማ)** ብቻ ነው።
• **ጥብቅ የደህንነት ቁጥጥር (RBAC):** የሻጭ ማጽደቂያው endpoint (\`PUT /api/admin/sellers/:id/approve\`) የተቆለፈ ሲሆን ሌሎች የአድሚን ክፍሎች (ገንዘብ ያዥ/ካሺየር፣ ኢንቬንቶሪ ወይም አድራሽ) ሻጭ ማጽደቅ አይችሉም፤ ለመሞከር ቢሞክሩ \`403 Forbidden\` ክልከላ ይደርሳቸዋል።
• **ሻጭ ለመሆን:** በ **ሻጭ ይሁኑ (Become a Seller)** ገጽ ላይ የንግድ ስምዎንና የብሔራዊ መታወቂያ ፎቶ ያስገቡ። ሸለማ ሲያረጋግጥ ሱቅዎ ወዲያውኑ ስራ ይጀምራል!`,
          links: [
            { label: "✨ ሻጭ ለመሆን ያመልክቱ", to: "/become-seller" },
            { label: "👑 የአድሚን ዳሽቦርድ", to: "/admin" },
            { label: "✉️ እገዛና ድጋፍ", to: "/contact" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}👑 **Hayyama Gurgurtuu Mirkaneessuu fi Qajeelfama:**
• **Abbaa Qabeenyaa / Super Admin Qofa (Shelema):** Sirna kana keessatti gurgurtoota haaraa ilaaluu fi mirkaneessuuf aangoo qulqulluu kan qabu **Super Admin (Shelema)** qofaadha.
• **Eegumsa Cimaa (RBAC):** Qajeelfamni mirkaneessuu (\`PUT /api/admin/sellers/:id/approve\`) eegamaadha. Hojjettoonni biroo (qabaa maallaqaa, inveentorii, geejjibaa) gurgurtuu mirkaneessuu hin danda'an; yoo yaalan \`403 Forbidden\` agarsiisa.
• **Gurgurtuu Ta'uuf:** Fuula **Gurgurtuu Ta'aa (Become a Seller)** irratti Maqaa Daldalaa fi Waraqaa Eenyummaa fe'aa. Shelema erga mirkaneessee booda oomisha gurguruu dandeessu!`,
          links: [
            { label: "✨ Gurgurtuu Ta'uuf Galmaa'aa", to: "/become-seller" },
            { label: "👑 Daashboordii Hojjettootaa", to: "/admin" },
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}👑 **Seller Approval Authority & Strict RBAC Security Policy:**
• **Sole Authority (Super Admin Shelema):** On this platform, **only the Super Admin (Shelema - Platform Owner)** possesses the authority to review and approve new marketplace seller applications.
• **Cryptographic RBAC Enforcement:** The backend approval route (\`PUT /api/admin/sellers/:id/approve\`) strictly checks the requester's role. Other staff roles (such as Cashier/Finance, Inventory Manager, Delivery) receive an HTTP \`403 Forbidden\` error if they attempt to approve sellers.
• **Onboarding Process:** Aspiring sellers apply via the **Become a Seller** page by uploading their Store Name and a valid National ID or Trade License. Once Shelema verifies the credentials, the merchant seller portal unlocks.`,
        links: [
          { label: "✨ Apply as Seller", to: "/become-seller" },
          { label: "👑 Staff Portal", to: "/admin" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // ── 2. Staff Roles & Role-Based Access Control (RBAC) Architecture ─────────
    if (
      q.includes("rbac") ||
      q.includes("roles") ||
      q.includes("staff role") ||
      q.includes("permissions") ||
      q.includes("super admin") ||
      q.includes("cashier") ||
      q.includes("finance") ||
      q.includes("inventory manager") ||
      q.includes("delivery role") ||
      q.includes("shelema") ||
      q.includes("ስልጣን") ||
      q.includes("ሚና") ||
      q.includes("ሰራተኞች") ||
      q.includes("gahee") ||
      q.includes("hojjettoota")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}👑 **የሰራተኞች የስልጣን ደረጃዎችና መዋቅር (RBAC Architecture):**
• **ሱፐር አድሚን (ሸለማ - ዋና ባለቤት):** ሙሉ የሲስተም ቁጥጥር፣ የሰራተኞች ምደባ፣ የዳታቤዝ እና የፋይናንስ አስተዳደር፤ እንዲሁም **ሻጮችን የማጽደቅ ብቸኛ ስልጣን** ያለው አካል ነው።
• **ገንዘብ ያዥ / ካሺየር (Cashier / Finance):** ደንበኞች በባንክና በቴሌብር የላኩትን ደረሰኝ እና የትራንዛክሽን መለያ (\`txRef\`) መርምሮ ያጸድቃል ወይም ውድቅ ያደርጋል።
• **ኢንቬንቶሪ ማኔጀር (Inventory Manager):** ምርቶችን፣ ስቶክ ክምችት፣ ምድቦችን ያስተዳድራል፤ በሻጮች የቀረቡ ምርቶችን ይመረምራል (\`/admin/product-approval\`)።
• **አድራሽ (Delivery Personnel):** ትዕዛዞችን ማድረስ፣ ሁኔታቸውን ማዘመን ("Processing" → "Shipped" → "Delivered") እና የማድረሻ አናሊቲክስ ሪፖርቶችን መመልከት ይችላል።
• **ሻጭ (Seller):** በሸለማ ከጸደቀ በኋላ የራሱን ምርቶች መመዝገብ፣ መሸጥና ማስተዳደር ይችላል።
• **ደንበኛ (Customer):** ምርቶችን መፈለግ፣ መግዛት፣ ደረሰኝ ማያያዝ እና ትዕዛዙ የደረሰበትን መከታተል ይችላል።`,
          links: [
            { label: "👑 ወደ አድሚን ዳሽቦርድ", to: "/admin" },
            { label: "✨ ሻጭ ለመሆን", to: "/become-seller" },
            { label: "👤 የእኔ ፕሮፋይል", to: "/profile" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}👑 **Caasaa Gahee Hojjettootaa (RBAC Architecture):**
• **Super Admin (Shelema - Abbaa Qabeenyaa):** Sirna guutuu kan to'atu, herrega, daldaltoota fi **gurgurtoota mirkaneessuuf aangoo qulqulluu** kan qabudha.
• **Qabaa Maallaqaa (Cashier / Finance):** Nagahee kaffaltii Telebirr fi Baankii (CBE, BOA, Awash) qoratee mirkaneessa.
• **Hogganaa Inveentorii (Inventory Manager):** Oomishaalee, kuusaa, ramaddii fi oomisha gurgurtootaa qorata (\`/admin/product-approval\`).
• **Geejjibaa (Delivery Personnel):** Ajaja geessuu, haala jijjiiruu ("Processing" → "Shipped" → "Delivered") fi gabaasa geejjibaa ilaala.
• **Gurgurtuu (Seller):** Shelemaan erga mirkanaa'ee booda oomisha isaa fe'ee gurgura.
• **Maamila (Customer):** Oomisha barbaaduu, bituu, nagahee erguu fi ajaja hordofuu danda'a.`,
          links: [
            { label: "👑 Daashboordii Hojjettootaa", to: "/admin" },
            { label: "✨ Gurgurtuu Ta'aa", to: "/become-seller" },
            { label: "👤 Piroofaayilii Koo", to: "/profile" },
          ],
        };
      }
      return {
        text: `${fileNotice}👑 **Platform Role-Based Access Control (RBAC) Architecture:**
• **Super Admin (Shelema - Owner & CEO):** Sole owner with full system control over databases, finances, staff assignments, and **exclusive Seller Approval rights**.
• **Cashier / Finance:** Inspects and validates manual payment proofs (CBE, Telebirr, BOA, Awash), cross-checks \`txRef\` codes with bank statements, and logs approvals.
• **Inventory Manager:** Controls product listings, stock thresholds, categories, and handles **Product Approvals** for marketplace vendors (\`/admin/product-approval\`).
• **Delivery Personnel:** Manages dispatch logistics, order status progression ("Processing" → "Shipped" → "Delivered"), delivery routes, and delivery analytics.
• **Marketplace Seller:** Manages approved store listings, inventory, and vendor sales upon Super Admin verification.
• **Customer:** Explores 12 categories, places orders, uploads manual bank proofs, and tracks deliveries.`,
        links: [
          { label: "👑 Staff Portal", to: "/admin" },
          { label: "✨ Become a Seller", to: "/become-seller" },
          { label: "👤 My Profile", to: "/profile" },
        ],
      };
    }

    // ── 3. User Identity & Active Role Status Query ────────────────────────────
    if (
      q.includes("who am i") ||
      q.includes("my role") ||
      q.includes("what is my role") ||
      q.includes("my account") ||
      q.includes("current user") ||
      q.includes("ማነኝ") ||
      q.includes("የእኔ ሚና") ||
      q.includes("eenyu ani")
    ) {
      if (user) {
        return {
          text: `${fileNotice}👤 **Your Active Account Profile:**
• **Name:** ${user.name || "User"}
• **Email:** ${user.email}
• **Platform Role:** **${user.role || "Customer"}**

${
  user.role === "SuperAdmin" || user.role === "super_admin" || user.role === "owner"
    ? "👑 **Permissions:** You are the Platform Owner / Super Admin. You have complete administrative control, including user management and **exclusive rights to approve new sellers**."
    : user.role === "CashierFinance" || user.role === "cashier"
    ? "💵 **Permissions:** You are Cashier / Finance staff. You have authority to review and approve manual payment receipts (CBE, Telebirr, BOA, Awash)."
    : user.role === "InventoryManager"
    ? "📦 **Permissions:** You are Inventory Manager. You can manage products, stock counts, categories, and approve seller-submitted products."
    : user.role === "Delivery"
    ? "🚚 **Permissions:** You are Delivery personnel. You have authority to update order shipping statuses and review delivery analytics."
    : user.role === "Seller" || user.role === "seller"
    ? "🏪 **Permissions:** You are an approved Marketplace Seller with access to your vendor catalog and sales tools."
    : "🛍️ **Permissions:** You are a registered Customer. You can shop, place orders, upload bank receipts, and track shipments."
}`,
          links: [
            { label: "👤 View Full Profile", to: "/profile" },
            { label: "📦 My Orders", to: "/my-orders" },
            ...(user.role && user.role !== "Customer"
              ? [{ label: "👑 Staff Dashboard", to: "/admin" }]
              : []),
          ],
        };
      }
      return {
        text: `${fileNotice}👤 **You are currently browsing as a Guest:**
You are not logged in yet. Please log in or register to track your orders, submit payments, or access staff portals.`,
        links: [
          { label: "🔑 Login", to: "/login" },
          { label: "🔐 Register", to: "/register" },
        ],
      };
    }

    // ── 4. What Happens After Uploading Payment Receipt ────────────────────────
    if (
      q.includes("after upload") ||
      q.includes("after payment") ||
      q.includes("uploaded receipt") ||
      q.includes("what happens after") ||
      q.includes("receipt verification") ||
      q.includes("proof verified") ||
      q.includes("why pending") ||
      q.includes("pending status") ||
      q.includes("ደረሰኝ ከላኩ") ||
      q.includes("ክፍያ ከፈፀምኩ በኋላ") ||
      q.includes("ፔንዲንግ") ||
      q.includes("nagahee erga") ||
      q.includes("kaffaltii booda")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}📦 **የክፍያ ደረሰኝ ከላኩ በኋላ ምን ይሆናል? (የትዕዛዝ ሂደት)**
1. **በካሺየር ማረጋገጥ:** የፋይናንስ ቡድናችን የላኩትን የደረሰኝ ፎቶ እና የትራንዛክሽን መለያ (\`txRef\`) ከባንክ ዝውውር ጋር ያመሳክራል።
2. **ወደ 'Processing' ይቀየራል:** ክፍያው ሲረጋገጥ (ከ15 እስከ 45 ደቂቃ ውስጥ) ትዕዛዝዎ ከ **Pending** ወደ **Processing** ይቀየራል፤ የማረጋገጫ መልእክት ይደርስዎታል።
3. **ዕቃውን ማሸግ:** የዕቃ ክምችት ቡድናችን ጥራቱን መርምሮ ዕቃዎን በደህንነት ማህተም ያሽጋል።
4. **ለአድራሽ ማስረከብ:** ጥቅሉ ለአድራሽ ሰራተኛ ይሰጣል፤ ትዕዛዝዎም ወደ **Shipped / Out for Delivery** ይቀየራል።
5. **በርዎ ድረስ ማድረስ:** ዕቃው በርዎ ድረስ ይደርስዎታል (**Delivered**)!`,
          links: [
            { label: "📦 ትዕዛዞቼን እይ", to: "/my-orders" },
            { label: "📜 የክፍያ ታሪክ", to: "/payment-history" },
            { label: "✉️ የደንበኞች ድጋፍ", to: "/contact" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}📦 **Nagahee Kaffaltii Erga Feetanii Booda Maaltu Ta'a?**
1. **Qorannoo Qabaa Maallaqaa:** Gareen faayinaansii nagahee fi lakkoofsa kaffaltii keessan (\`txRef\`) baankii waliin mirkaneessa.
2. **Haalli Gara 'Processing' Jijjiirama:** Erga mirkanaa'ee booda ajajni keessan **Pending** irraa gara **Processing** tti jijjiirama.
3. **Qulqullina fi Saamsuu:** Oomishni keessan qulqullinni isaa qoratamee eegumsan saamsama.
4. **Geejjibaaf Kennuu:** Meeshaan nama geejjibaaf kennama; haalli isaas **Shipped / Out for Delivery** jedhama.
5. **Hulaa Keessanitti Dhihaachuu:** Meeshaan hulaa keessan ga'a (**Delivered**)!`,
          links: [
            { label: "📦 Ajaja Koo Hordofaa", to: "/my-orders" },
            { label: "📜 Seenaa Kaffaltii", to: "/payment-history" },
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}📦 **What Happens After You Upload Your Payment Receipt?**
1. **Cashier / Finance Verification:** Our Finance team inspects your uploaded receipt screenshot and matches your Transaction Reference (\`txRef\`) against bank statements.
2. **Status Changes to Processing:** Once verified (typically within 15–45 minutes), your order transitions from **Pending** to **Processing**, and you receive a confirmation notification.
3. **Packaging & Quality Inspection:** Warehouse staff carefully inspects and packages your electronics with tamper-proof security seals.
4. **Dispatch to Delivery:** The package is handed to our Delivery driver; your status updates to **Shipped / Out for Delivery** with route details.
5. **Doorstep Arrival:** Package arrives at your delivery location (**Delivered**)!`,
        links: [
          { label: "📦 Track My Orders", to: "/my-orders" },
          { label: "📜 View Payment History", to: "/payment-history" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // ── 5. End-to-End Walkthrough: How to Register and Buy ─────────────────────
    if (
      q.includes("how to buy") ||
      q.includes("how do i buy") ||
      q.includes("register and buy") ||
      q.includes("how to purchase") ||
      q.includes("shopping process") ||
      q.includes("how it works") ||
      q.includes("step by step") ||
      q.includes("order flow") ||
      q.includes("system architecture") ||
      q.includes("እንዴት መግዛት") ||
      q.includes("የግዢ ሂደት") ||
      q.includes("እንዴት ልግዛ") ||
      q.includes("ዕቃ መግዛት") ||
      q.includes("akkamitti bituun") ||
      q.includes("adeemsa bittaa")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}🛒 **የምዝገባና የግዢ ሙሉ ሂደት ደረጃ በደረጃ:**
1. **ይመዝገቡ ወይም ይግቡ:** በ **መመዝገቢያ** ገጽ (\`/register\`) መለያ ይክፈቱ ወይም በ **መግቢያ** (\`/login\`) ይግቡ።
2. **ምርቶችን ይፈልጉ:** ከ12ቱ የቴክኖሎጂ ምድቦች (\`/products\`) ይምረጡ፤ የቅናሽ ዋጋዎችንና የተሰረዘውን ዋና ዋጋ ይመልከቱ።
3. **ወደ ጋሪ ያስገቡ:** የሚፈልጉትን ዕቃ መርጠው **Add to Cart** ይጫኑ፤ በጋሪዎ ገጽ (\`/cart\`) ይገምግሙ።
4. **ቼክአውት:** አድራሻዎን ያስገቡና የክፍያ አማራጭ ይምረጡ (Chapa ፈጣን ክፍያ፣ በባንክ/ቴሌብር ደረሰኝ በማያያዝ፣ ወይም ጥሬ ገንዘብ ሲረከቡ)።
5. **ትዕዛዝዎን ይከታተሉ:** በ **የእኔ ትዕዛዞች** ገጽ (\`/my-orders\`) ዕቃዎ የደረሰበትን ደረጃ ይከታተሉ!`,
          links: [
            { label: "🛍️ ምርቶችን ይመልከቱ", to: "/products" },
            { label: "🛒 ጋሪዎን ይመልከቱ", to: "/cart" },
            { label: "🔐 መለያ ይክፈቱ", to: "/register" },
            { label: "📦 የእኔ ትዕዛዞች", to: "/my-orders" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🛒 **Qajeelfama Galmee fi Bittaa Sadarkaa Sadarkaan:**
1. **Galmaa'aa ykn Seenaa:** Fuula **Galmee** (\`/register\`) irratti herrega banaa ykn **Seensaan** (\`/login\`) seenaa.
2. **Oomisha Filadhaa:** Ramaddii 12 keessaa (\`/products\`) filadhaa; gatii hir'ifamee fi gatii duraanii ilaalaa.
3. **Gara Kuusaa Bittaa (Cart):** Meeshaa barbaaddan **Add to Cart** jedhaa; fuula \`/cart\` irratti gamaaggamaa.
4. **Checkout:** Teessoo keessan galchaa, kaffaltii filadhaa (Chapa battalaa, Telebirr/Baankii nagaheen, ykn yeroo simattanu).
5. **Ajaja Hordofaa:** Fuula **Ajaja Koo** (\`/my-orders\`) irratti haala geejjibaa hordofaa!`,
          links: [
            { label: "🛍️ Oomisha Hunda", to: "/products" },
            { label: "🛒 Kuusaa Bittaa", to: "/cart" },
            { label: "🔐 Galmaa'aa", to: "/register" },
            { label: "📦 Ajaja Koo", to: "/my-orders" },
          ],
        };
      }
      return {
        text: `${fileNotice}🛒 **Complete Step-by-Step Guide: How to Register and Buy:**
1. **Register or Log In:** Visit **Register** (\`/register\`) to create an account or **Login** (\`/login\`) with your credentials.
2. **Explore Catalog & Deals:** Browse 12 tech categories (\`/products\`) or search by budget. Look for bold discount prices next to strikethrough original prices!
3. **Add to Cart:** Select your preferred gadget and click **Add to Cart**, then review your items at \`/cart\`.
4. **Checkout:** Enter your shipping address and choose your payment method:
   • **Chapa:** Instant card & mobile bank checkout.
   • **Manual Transfer (CBE, Telebirr, BOA, Awash):** Transfer the total, enter \`txRef\`, and upload your receipt screenshot.
   • **Cash on Delivery (COD):** Pay in cash when delivered.
5. **Track Your Order:** Monitor live status from \`Pending\` → \`Processing\` → \`Shipped\` → \`Delivered\` on your **My Orders** page (\`/my-orders\`).`,
        links: [
          { label: "🛍️ Browse Products", to: "/products" },
          { label: "🛒 View Cart", to: "/cart" },
          { label: "🔐 Register Account", to: "/register" },
          { label: "📦 Track Orders", to: "/my-orders" },
        ],
      };
    }

    // ── 6. Authentication, Registration, Login Routing & Password Reset ───────
    if (
      q.includes("register") ||
      q.includes("signup") ||
      q.includes("sign up") ||
      q.includes("login") ||
      q.includes("log in") ||
      q.includes("sign in") ||
      q.includes("jwt") ||
      q.includes("token") ||
      q.includes("password reset") ||
      q.includes("forgot password") ||
      q.includes("reset password") ||
      q.includes("auth") ||
      q.includes("መመዝገብ") ||
      q.includes("ተመዝገብ") ||
      q.includes("መለያ ክፈት") ||
      q.includes("መግባት") ||
      q.includes("ግባ") ||
      q.includes("የይለፍ ቃል") ||
      q.includes("ይለፍ ቃል ረሳሁ") ||
      q.includes("galmee") ||
      q.includes("galmaa'i") ||
      q.includes("seensa") ||
      q.includes("seenuu") ||
      q.includes("jecha darbii")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}🔐 **የምዝገባ፣ የመግቢያና የይለፍ ቃል አወቃቀር:**
• **ምዝገባ (\`/register\`):** መለያዎ በከፍተኛ ደህንነት (bcrypt ምስጠራ) በዳታቤዝ ውስጥ ይመዘገባል። ስም፣ ኢሜይልና የይለፍ ቃል ብቻ ያስፈልግዎታል።
• **መግቢያና JWT ቶከን (\`/login\`):** ትክክለኛ መረጃ ሲያስገቡ የJWT ቶከን ተሰጥቶት በደህንነት ሲስተሙን ይጠቀማሉ።
• **የሚና አቅጣጫ አመዳደብ (Login Routing):**
  - ደንበኞች በቀጥታ ወደ ግብይት፣ ጋሪ ወይም የግል ፕሮፋይል ይመራሉ።
  - የሰራተኞች አካላት (ሱፐር አድሚን፣ ኢንቬንቶሪ፣ ካሺየር፣ አድራሽ፣ ሻጭ) ደግሞ ወደ \`/admin\` ዳሽቦርድ መግባት ይችላሉ።
• **የይለፍ ቃል ከረሱ (\`/forgot-password\`):** ኢሜይልዎን በማስገባት የይለፍ ቃልዎን በአዲስ መቀየር ይችላሉ።`,
          links: [
            { label: "🔐 ይመዝገቡ (Register)", to: "/register" },
            { label: "🔑 ይግቡ (Login)", to: "/login" },
            { label: "🔄 የይለፍ ቃል መቀየሪያ", to: "/forgot-password" },
            { label: "👤 የግል ፕሮፋይል", to: "/profile" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🔐 **Caasaa Galmee, Seensaa fi Jecha Darbii:**
• **Galmee (\`/register\`):** Herregni keessan eegumsa olaanaadhaan (bcrypt) daataabeezii keessatti qabama.
• **Seensa & JWT Token (\`/login\`):** Ragaa keessan mirkaneessuun JWT token fayyadamaa uuma.
• **Qajeelcha Seensaa (Login Routing):**
  - Maamiltoonni gara fuula oomishaa, kuusaa bittaa ykn piroofaayilii qajeelu.
  - Hojjettoonni (Super Admin, Inveentorii, Qabaa Maallaqaa, Geejjibaa, Gurgurtuu) gara \`/admin\` tti seenuu danda'u.
• **Jecha Darbii Dagatan (\`/forgot-password\`):** Imeeyilii galchuun jecha darbii haaraa jijjiiruu dandeessu.`,
          links: [
            { label: "🔐 Galmaa'aa", to: "/register" },
            { label: "🔑 Seenaa", to: "/login" },
            { label: "🔄 Jecha Darbii Jijjiiraa", to: "/forgot-password" },
            { label: "👤 Piroofaayilii", to: "/profile" },
          ],
        };
      }
      return {
        text: `${fileNotice}🔐 **Authentication, Registration & Login Routing Architecture:**
• **Registration (\`/register\`):** Creates your account securely in MongoDB with bcrypt password encryption. Requires Full Name, Email, and Password.
• **Login & JWT Token (\`/login\`):** Validates credentials and generates an authenticated JSON Web Token (JWT) stored in browser storage for session security.
• **Intelligent Role Routing:**
  - Customers are guided to browse products, their cart, or profile.
  - Staff members (\`SuperAdmin\`, \`Admin\`, \`InventoryManager\`, \`CashierFinance\`, \`Delivery\`, \`Seller\`) can seamlessly access the unified admin dashboard at \`/admin\`.
• **Forgot / Reset Password (\`/forgot-password\`):** Enter your email to receive a secure password reset token and update your credentials easily.`,
        links: [
          { label: "🔐 Register Account", to: "/register" },
          { label: "🔑 Login Now", to: "/login" },
          { label: "🔄 Forgot Password", to: "/forgot-password" },
          { label: "👤 View Profile", to: "/profile" },
        ],
      };
    }

    // ── 7. Checkout & Manual Payment Architecture (CBE, Telebirr, BOA, Awash) ──
    if (
      q.includes("pay") ||
      q.includes("telebirr") ||
      q.includes("cbe") ||
      q.includes("awash") ||
      q.includes("abyssinia") ||
      q.includes("boa") ||
      q.includes("chapa") ||
      q.includes("manual payment") ||
      q.includes("txref") ||
      q.includes("cod") ||
      q.includes("cash on delivery") ||
      q.includes("receipt") ||
      q.includes("proof") ||
      q.includes("bank") ||
      q.includes("ክፍያ") ||
      q.includes("ቴሌብር") ||
      q.includes("ሲቢኢ") ||
      q.includes("ባንክ") ||
      q.includes("አቢሲኒያ") ||
      q.includes("አዋሽ") ||
      q.includes("kaffaltii") ||
      q.includes("baankii")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}💳 **የክፍያ አማራጮችና የባንክ ማስተላለፍ መመሪያ:**
1. **ቴሌብር (Telebirr):** ወደ ይፋዊ የንግድ መለያችን ክፍያ ይፈጽሙና ደረሰኝ በቼክአውት ገጽ ይላኩ።
2. **የኢትዮጵያ ንግድ ባንክ (CBE & CBE Birr):** በሂሳብ ቁጥር ወይም በሲቢኢ ብር አስተላልፈው ደረሰኝ ያያይዙ።
3. **አቢሲኒያ ባንክ (Bank of Abyssinia):** በሞባይል ባንኪንግ ወይም በቅርንጫፍ አስተላልፈው ደረሰኝ ይላኩ።
4. **አዋሽ ባንክ (Awash Bank):** በቀጥታ የሂሳብ ማስተላለፍ ደረሰኝ ያያይዙ።
5. **Chapa (ቀጥታ ክፍያ):** በካርድ ወይም በሞባይል ባንኪንግ ወዲያውኑ ይክፈሉ።
6. **ጥሬ ገንዘብ ሲረከቡ (COD):** በአዲስ አበባ ብቻ ሲደርስዎ ይክፈሉ።

📝 **የማስተላለፍ ቅደም-ተከተል:** ገንዘቡን ካስተላለፉ በኋላ የትራንዛክሽን ቁጥሩን (\`txRef\`) እና የደረሰኙን ፎቶ በቼክአውት ገጽ ላይ በማያያዝ ትዕዛዙን ያጠናቁ።`,
          links: [
            { label: "💳 ወደ ቼክአውት ይሂዱ", to: "/checkout" },
            { label: "🛒 ጋሪዎን ይመልከቱ", to: "/cart" },
            { label: "📜 የክፍያ ታሪክ", to: "/payment-history" },
            { label: "❓ የክፍያ FAQ", to: "/faq" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}💳 **Filannoowwan Kaffaltii & Qajeelfama:**
1. **Telebirr:** Lakkoofsa daldalaa keenyatti erga kaffaltanii booda nagahee fuula checkout irratti fe'aa.
2. **Baankii Daldala Itiyoophiyaa (CBE & CBE Birr):** Lakkoofsa herregaatti dabarsuun nagahee qabsiisaa.
3. **Baankii Abisiiniyaa (BOA):** Moobaayilaan ykn dameedhaan dabarsuun nagahee fe'aa.
4. **Baankii Awaash (Awash Bank):** Dabarsa herregaa fi nagahee mirkaneessaa.
5. **Chapa (Kaffaltii Battalaa):** Kaardii ykn baankii moobaayilaatiin battalatti kaffalaa.
6. **Yeroo Geejjibaa Kaffaluu (COD):** Finfinnee keessatti yeroo meeshaan isin ga'u kaffaluu dandeessu.

📝 **Qajeelfama:** Maallaqa erga dabarsitanii booda lakkoofsa kaffaltii (\`txRef\`) fi suuraa nagahee fuula checkout irratti fe'aa.`,
          links: [
            { label: "💳 Fuula Checkout", to: "/checkout" },
            { label: "🛒 Kuusaa Bittaa", to: "/cart" },
            { label: "📜 Seenaa Kaffaltii", to: "/payment-history" },
            { label: "❓ Gaaffilee FAQ", to: "/faq" },
          ],
        };
      }
      return {
        text: `${fileNotice}💳 **Accepted Payment Methods & Step-by-Step Manual Transfer Guide:**
1. **Telebirr & CBE Birr:** Transfer funds to our official merchant account and upload your payment proof screenshot during checkout.
2. **Commercial Bank of Ethiopia (CBE):** Direct account deposit or mobile banking transfer.
3. **Bank of Abyssinia (BOA):** Direct account transfer or BOA mobile banking.
4. **Awash Bank:** Direct account deposit or mobile wallet.
5. **Chapa (Instant Card & Mobile):** Pay instantly with Debit/Credit Card or mobile wallets with real-time checkout confirmation.
6. **Cash on Delivery (COD):** Available in Addis Ababa and selected regional cities.

📝 **Manual Transfer Instructions:** Complete your bank transfer, note the Transaction Reference Number (\`txRef\`), take a screenshot of the receipt, and upload it in the checkout payment form to complete your order!`,
        links: [
          { label: "💳 Go to Checkout", to: "/checkout" },
          { label: "🛒 View Cart", to: "/cart" },
          { label: "📜 Payment History", to: "/payment-history" },
          { label: "❓ Read Payment FAQ", to: "/faq" },
        ],
      };
    }

    // ── 8. Order Tracking & Delivery Logistics Architecture ────────────────────
    if (
      q.includes("shipping") ||
      q.includes("delivery") ||
      q.includes("track") ||
      q.includes("status") ||
      q.includes("dispatch") ||
      q.includes("logistics") ||
      q.includes("order") ||
      q.includes("arrive") ||
      q.includes("time") ||
      q.includes("ማድረሻ") ||
      q.includes("መላኪያ") ||
      q.includes("ትዕዛዝ") ||
      q.includes("የት ደረሰ") ||
      q.includes("መቼ ይደርሳል") ||
      q.includes("geejjiba") ||
      q.includes("ajaja") ||
      q.includes("yoom")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}🚚 **የትዕዛዝ ሂደትና የማድረሻ ሎጅስቲክስ:**
• **የትዕዛዝ ደረጃዎች (Order Lifecycle):**
  - ⏳ **Pending:** ትዕዛዝዎ ተመዝግቧል፣ ደረሰኝ በካሺየር እየተረጋገጠ ነው።
  - ⚙️ **Processing:** ክፍያ ጸድቋል፣ ዕቃው በጥራት ተመርምሮ እየታሸገ ነው።
  - 🚚 **Shipped / Out for Delivery:** ለአድራሽ ሰራተኛ ተሰጥቷል፣ በመንገድ ላይ ነው።
  - ✅ **Delivered:** ደንበኛው ጋር ደርሶ ተረክበዋል።
• **የአድራሽ ሰራተኞች ሚና:** አድራሾች ትዕዛዞችን የመረከብ፣ ሁኔታቸውን ማዘመን እና የማድረሻ ሪፖርቶችን የመመልከት ስልጣን አላቸው።
• **የማድረሻ ጊዜ:**
  - **አዲስ አበባ:** ከ1 እስከ 2 ቀናት ውስጥ በበርዎ ይደርሳል።
  - **ክልል ከተሞች:** ከ3 እስከ 5 ቀናት ውስጥ በፈጣን ፖስታ ወይም ካርጎ ይደርሳል።`,
          links: [
            { label: "📦 ትዕዛዞቼን እይ", to: "/my-orders" },
            { label: "🚚 የማድረሻ ፖሊሲ", to: "/shipping-info" },
            { label: "↩️ የመመለሻ ፖሊሲ", to: "/returns" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🚚 **Sadarkaa Ajajaa & Qajeelfama Geejjibaa:**
• **Sadarkaalee Ajajaa:**
  - ⏳ **Pending:** Ajajni galmeeffamee qabaa maallaqaatiin eegama jira.
  - ⚙️ **Processing:** Kaffaltiin mirkanaa'eera, oomishni saamsamaa jira.
  - 🚚 **Shipped / Out for Delivery:** Geejjibaaf kennamee karaa irra jira.
  - ✅ **Delivered:** Maamila bira ga'ee simatameera.
• **Gahee Geejjibaa:** Gareen geejjibaa haala ajajaa jijjiiruu fi gabaasa geejjibaa ilaaluu danda'u.
• **Yeroo Geejjibaa:** Finfinnee guyyaa 1-2; naannolee guyyaa 3-5.`,
          links: [
            { label: "📦 Ajaja Koo Hordofaa", to: "/my-orders" },
            { label: "🚚 Odeeffannoo Geejjibaa", to: "/shipping-info" },
            { label: "↩️ Imaammata Deebii", to: "/returns" },
          ],
        };
      }
      return {
        text: `${fileNotice}🚚 **Order Lifecycle & Delivery Logistics Architecture:**
• **Order Lifecycle States:**
  - ⏳ **Pending:** Order placed; manual payment receipt awaiting Cashier verification.
  - ⚙️ **Processing:** Payment approved; item undergoing quality check and tamper-proof packaging.
  - 🚚 **Shipped / Out for Delivery:** Assigned to Delivery personnel on transit route.
  - ✅ **Delivered:** Package handed over to customer and confirmed.
• **Delivery Personnel Role:** Dedicated delivery personnel manage fulfillment dispatch, update statuses in real-time, coordinate routes, and monitor delivery analytics reports at \`/admin/reports\`.
• **Delivery Timelines:** 1–2 business days in Addis Ababa; 3–5 business days for regional cities via domestic cargo.`,
        links: [
          { label: "📦 Track My Orders", to: "/my-orders" },
          { label: "🚚 Full Shipping Policy", to: "/shipping-info" },
          { label: "↩️ Return Policy", to: "/returns" },
        ],
      };
    }

    // ── 9. Browsing, 12 Categories & Discount Pricing Display Architecture ─────
    if (
      q.includes("category") ||
      q.includes("categories") ||
      q.includes("catalog") ||
      q.includes("browse") ||
      q.includes("discount") ||
      q.includes("strikethrough") ||
      q.includes("slashed") ||
      q.includes("deal") ||
      q.includes("deals") ||
      q.includes("sale") ||
      q.includes("price") ||
      q.includes("pricing") ||
      q.includes("ምድብ") ||
      q.includes("ምድቦች") ||
      q.includes("ካታሎግ") ||
      q.includes("ቅናሽ") ||
      q.includes("ዋጋ") ||
      q.includes("የተሰረዘ ዋጋ") ||
      q.includes("ቅናሾች") ||
      q.includes("ramaddii") ||
      q.includes("hir'ina") ||
      q.includes("gatii")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}🛍️ **የካታሎግ እና የቅናሽ ዋጋዎች አሰራር:**
• **12 ዋና ምድቦች:** ላፕቶፖች፣ ስልኮች፣ ጌሚንግ፣ ኔትወርክ፣ ስማርት መገልገያዎች፣ ስማርት ሰዓት፣ የድምጽ ዕቃዎች፣ ታብሌቶች፣ ድሮኖች፣ ፕሪንተሮች፣ ስማርት ሆም እና ካሜራዎች።
• **የቅናሽ ዋጋ አቀራረብ:** በቅናሽ ላይ ያሉ ምርቶች ዋናውን መደበኛ ዋጋ በተሰረዘ ቅርጸት (ምሳሌ፡ \`<s>1,500 ETB</s>\`) ከአዲሱ ደማቅ የቅናሽ ዋጋ (ምሳሌ፡ **1,250 ETB**) ጎን ያሳያሉ።
• **የበጀት ፍለጋ:** በፈለጉት የዋጋ ገደብ (ምሳሌ፡ *"ከ30,000 ብር በታች ላፕቶፖች"*) መፈለግ ይችላሉ!`,
          links: [
            { label: "🛍️ ሙሉ ካታሎግ", to: "/products" },
            { label: "💻 ላፕቶፖች", to: "/products?category=Laptops" },
            { label: "📱 ስልኮች", to: "/products?category=Smartphones" },
            { label: "🎮 ጌሚንግ", to: "/products?category=Gaming" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🛍️ **Caasaa Kuusaa Oomishaa & Gatii Hir'ifame:**
• **Ramaddii 12:** Laaptooppii, Bilbila, Geemiingii, Neetwoorkii, Meeshaalee Ismaartii, Sa'aatii Ismaartii, Sagalee, Taableetii, Diroonii, Piriintarii, Ismaart Hoom, fi Kaameraa.
• **Agarsiisa Gatii:** Oomisha gatiin hir'ifame irratti gatiin duraanii sararamee (fkn \`<s>1,500 ETB</s>\`) gatii haaraa cinaatti mul'ata.
• **Gatii Barbaaddan:** Gatii barbaaddaniin oomisha barbaaduu dandeessu (fkn *"laaptooppii 35000 gad"*).`,
          links: [
            { label: "🛍️ Oomisha Hunda", to: "/products" },
            { label: "💻 Laaptooppii", to: "/products?category=Laptops" },
            { label: "📱 Bilbila", to: "/products?category=Smartphones" },
            { label: "🎮 Geemiingii", to: "/products?category=Gaming" },
          ],
        };
      }
      return {
        text: `${fileNotice}🛍️ **Catalog Architecture & Discount Pricing System:**
• **12 Verified Categories:** Laptops, Smartphones, Gaming, Network, Smart Accessories, Smart Watch, Headphones & Audio, Tablets, Drones, Printers & Scanners, Smart Home, and Cameras.
• **Discount Display:** On promotional items, the slashed original normal price (e.g., \`<s>1,500 ETB</s>\`) is shown with a strikethrough alongside the bold discounted price (e.g., **1,250 ETB**), so you can instantly see your exact savings!
• **Smart Budget Filtering:** You can ask me to find products under any budget (e.g., *"laptops under 35000 ETB"* or *"phones under 20000"*).`,
        links: [
          { label: "🛍️ All Products", to: "/products" },
          { label: "💻 Laptops", to: "/products?category=Laptops" },
          { label: "📱 Smartphones", to: "/products?category=Smartphones" },
          { label: "🎮 Gaming", to: "/products?category=Gaming" },
        ],
      };
    }

    // ── 10. Warranty & Returns ─────────────────────────────────────────────────
    if (
      q.includes("return") ||
      q.includes("refund") ||
      q.includes("warranty") ||
      q.includes("broken") ||
      q.includes("guarantee") ||
      q.includes("ዋስትና") ||
      q.includes("መመለስ") ||
      q.includes("wabiin") ||
      q.includes("deebisuu")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}🛡️ **የዋስትና እና የመመለሻ መመሪያ:**
• **የ1 ዓመት ዋስትና:** ሁሉም ላፕቶፖች፣ ስልኮች እና የኤሌክትሮኒክስ ዕቃዎች ከፋብሪካ የ1 ዓመት ሙሉ ዋስትና ጋር ይሰጣሉ።
• **የ30 ቀን መመለሻ ዋስትና:** ዕቃው እንከን ካለበት ወይም ትክክለኛ ካልሆነ በ30 ቀናት ውስጥ መመለስ ወይም መቀየር ይችላሉ።
• 100% ኦሪጅናል እና አስተማማኝ ምርቶች ብቻ ናቸው የሚቀርቡት።`,
          links: [
            { label: "↩️ የመመለሻ ፖሊሲ", to: "/returns" },
            { label: "✉️ የደንበኞች ድጋፍ", to: "/contact" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🛡️ **Wabiin fi Haala Deebii Meeshaa:**
• **Wabiin Waggaa 1:** Laaptooppiin, bilbilli fi meeshaaleen teeknolojii hundi wabiin waggaa 1 qabu.
• **Guyyaa 30 Keessatti Deebisuu:** Meeshaan rakkoo yoo qabaate guyyoota 30 keessatti deebisuun jijjiiruu ykn maallaqa keessan deeffachuu dandeessu.
• Oomishaalee qulqullina olaanaa fi orjinaala qofa dhiheessina.`,
          links: [
            { label: "↩️ Imaammata Deebii", to: "/returns" },
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}🛡️ **Warranty & Guarantee Coverage:**
• **1-Year Brand Warranty:** Every laptop, smartphone, tablet, and smart device comes with an official 1-year brand warranty.
• **30-Day Hassle-Free Returns:** If your product arrives defective or doesn't match specifications, initiate a return within 30 days for an exchange or full refund.
• 100% Genuine: All items are factory sealed and sourced directly from authorized manufacturers.`,
        links: [
          { label: "↩️ Return Policy", to: "/returns" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // ── 11. Become a Seller Application ───────────────────────────────────────
    if (
      q.includes("become seller") ||
      q.includes("seller application") ||
      q.includes("sell on") ||
      q.includes("open shop") ||
      q.includes("merchant portal") ||
      q.includes("ሻጭ መሆን") ||
      q.includes("መሸጥ እፈልጋለሁ") ||
      q.includes("gurguruu barbaada")
    ) {
      if (langCode === "am") {
        return {
          text: `${fileNotice}✨ **በቴክ ኢ-ኮሜርስ ላይ ሻጭ ለመሆን:**
1. የ **ሻጭ ይሁኑ (Become a Seller)** ገጽን ይጎብኙ።
2. የንግድ ስምዎን እና የብሔራዊ መታወቂያዎን (National ID) ፎቶ ያስገቡ።
3. ማመልከቻዎ በዋናው ባለቤት (ሸለማ) ከተረጋገጠ በኋላ ምርቶችን መመዝገብና መሸጥ መጀመር ይችላሉ!`,
          links: [
            { label: "✨ የሻጭ ማመልከቻ ገጽ", to: "/become-seller" },
            { label: "✉️ የድጋፍ ቡድን አግኙ", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}✨ **How to Become a Verified Merchant / Seller:**
1. Visit the **Become a Seller** page.
2. Provide your Business / Store Name and upload a clear photo of your National ID / Trade document.
3. Once reviewed and approved by the store Owner (Shelema), your merchant portal unlocks, and you can upload tech products to thousands of shoppers!`,
        links: [
          { label: "✨ Apply as Seller", to: "/become-seller" },
          { label: "✉️ Contact Partner Team", to: "/contact" },
        ],
      };
    }

    // ── 12. Intelligent Product Search with Natural Language, Brand & Budget Filter ──
    const budgetMatch =
      q.match(/(?:under|below|less than|gadani|በታች)\s*(\d+[\d,]*)/i) ||
      q.match(/(\d+[\d,]*)\s*(?:etb|birr|ብር)?\s*(?:በታች|gadani|under|below)/i) ||
      q.match(/(?:max|budget|limit)\s*[:=]?\s*(\d+[\d,]*)/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ""), 10) : null;

    // Detect target category from multi-lingual keywords
    let targetedCategory = null;
    for (const [catName, keywords] of Object.entries(CAT_KEYWORD_MAP)) {
      if (keywords.some((kw) => q.includes(kw))) {
        targetedCategory = catName;
        break;
      }
    }

    // Detect target brand
    let targetedBrand = null;
    for (const b of KNOWN_BRANDS) {
      if (q.includes(b)) {
        targetedBrand = b;
        break;
      }
    }

    // Tokenize query words without stopwords
    const queryTokens = q
      .replace(/[^\w\s\u1200-\u137F]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

    // Filter products
    const matchedProducts = productsCatalog.filter((p) => {
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const pBrand = (p.brand || "").toLowerCase();
      const pDesc = (p.description || "").toLowerCase();
      const price = p.discountPrice || p.price || 0;

      // Budget constraint
      if (maxBudget && price > maxBudget) {
        return false;
      }

      // 1. Direct text match
      if (pName.includes(q) || pCat.includes(q) || pBrand.includes(q)) {
        return true;
      }

      // 2. Target Category match
      if (targetedCategory && pCat.includes(targetedCategory.toLowerCase())) {
        if (targetedBrand) {
          return pBrand.includes(targetedBrand) || pName.includes(targetedBrand) || pDesc.includes(targetedBrand);
        }
        return true;
      }

      // 3. Target Brand match
      if (targetedBrand && (pBrand.includes(targetedBrand) || pName.includes(targetedBrand) || pDesc.includes(targetedBrand))) {
        return true;
      }

      // 4. Token matches
      if (queryTokens.length > 0) {
        const matchesAnyToken = queryTokens.some(
          (token) =>
            pName.includes(token) ||
            pCat.includes(token) ||
            pBrand.includes(token) ||
            pDesc.includes(token)
        );
        if (matchesAnyToken) return true;
      }

      return false;
    });

    if (matchedProducts.length > 0) {
      // Sort: products with active discounts first
      const sortedProds = [...matchedProducts].sort((a, b) => {
        const aHasDiscount = (a.discountPrice || 0) > 0 && a.discountPrice < a.price;
        const bHasDiscount = (b.discountPrice || 0) > 0 && b.discountPrice < b.price;
        if (aHasDiscount && !bHasDiscount) return -1;
        if (!aHasDiscount && bHasDiscount) return 1;
        return 0;
      });

      const topProducts = sortedProds.slice(0, 4);

      let introText = "";
      if (langCode === "am") {
        introText = maxBudget
          ? `✨ ከ **${maxBudget.toLocaleString()} ብር** በታች **${matchedProducts.length}** ምርቶች ተገኝተዋል:`
          : targetedCategory || targetedBrand
          ? `✨ ለ **${targetedBrand || targetedCategory}** **${matchedProducts.length}** ምርቶች ተገኝተዋል:`
          : `✨ የፈለጉትን የሚመጥኑ **${matchedProducts.length}** ምርቶች ተገኝተዋል:`;
      } else if (langCode === "om") {
        introText = maxBudget
          ? `✨ Gatii **${maxBudget.toLocaleString()} ETB** gadiin oomishaalee **${matchedProducts.length}** argamaniiru:`
          : targetedCategory || targetedBrand
          ? `✨ Oomishaalee **${targetedBrand || targetedCategory}** **${matchedProducts.length}** argamaniiru:`
          : `✨ Oomishaalee filataman **${matchedProducts.length}** argamaniiru:`;
      } else {
        introText = maxBudget
          ? `✨ Found **${matchedProducts.length} product(s)** under **${maxBudget.toLocaleString()} ETB**: Here are top recommendations:`
          : targetedCategory || targetedBrand
          ? `✨ Found **${matchedProducts.length} product(s)** matching **${targetedBrand || targetedCategory}**:`
          : `✨ Found **${matchedProducts.length} matching item(s)** in catalog:`;
      }

      return {
        text: `${fileNotice}${introText}`,
        products: topProducts,
        links: [
          {
            label: targetedCategory
              ? `🛍️ View All in ${targetedCategory}`
              : "🛍️ View Full Catalog",
            to: targetedCategory
              ? `/products?category=${encodeURIComponent(targetedCategory)}`
              : "/products",
          },
        ],
      };
    }

    if (targetedCategory || targetedBrand) {
      const term = targetedBrand || targetedCategory;
      if (langCode === "am") {
        return {
          text: `${fileNotice}🔍 ለ **${term}** የሚሆን ምርት አሁን በስቶክ ውስጥ አልተገኘም። አዳዲስ እቃዎች በየሳምንቱ ስለሚገቡ እባክዎን ሙሉ ካታሎጋችንን ይመልከቱ ወይም ልዩ ትዕዛዝ ለማስመጣት ያግኙን!`,
          links: [
            { label: "🛍️ ሙሉ ካታሎግ ይመልከቱ", to: "/products" },
            { label: "✉️ የደንበኞች ድጋፍ", to: "/contact" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `${fileNotice}🔍 Oomishni **${term}** jedhu yeroo ammaa kuusaa keessa hin jiru. Oomishoonni haaraan yeroo hunda waan dabalaniif kaataaloogii guutuu ilaalaa ykn nu quunnamaa!`,
          links: [
            { label: "🛍️ Oomisha Hunda", to: "/products" },
            { label: "✉️ Nu Quunnamaa", to: "/contact" },
          ],
        };
      }
      return {
        text: `${fileNotice}🔍 No products currently in stock matching "**${term}**"${maxBudget ? ` under ${maxBudget.toLocaleString()} ETB` : ""}. New inventory arrives weekly! Browse our complete catalog or contact our team for special inquiries:`,
        links: [
          { label: "🛍️ Browse Full Catalog", to: "/products" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // ── 13. General Tech Specs & Hardware Advice ───────────────────────────────
    if (
      q.includes("ram") ||
      q.includes("ssd") ||
      q.includes("m2") ||
      q.includes("m3") ||
      q.includes("intel") ||
      q.includes("spec") ||
      q.includes("core i")
    ) {
      return {
        text: `${fileNotice}⚙️ **Hardware & Tech Specs Recommendation:**
• **Students & Office Work:** Intel Core i5 or Ryzen 5 with **8GB RAM + 512GB SSD** is perfect for fast multitasking.
• **Software Engineers & Creators:** Intel Core i7 / Apple M2/M3 with **16GB+ RAM + 1TB NVMe SSD** for seamless coding & rendering.
• **Gamers:** Look for dedicated RTX 3060/4060+ GPUs and high refresh-rate 144Hz displays. Check our Gaming category for deals!`,
        links: [{ label: "💻 Explore Laptops", to: "/products?category=Laptops" }],
      };
    }

    // ── 14. Default Intelligent Fallback ───────────────────────────────────────
    return {
      text: `${fileNotice}${
        langCode === "am"
          ? `እባክዎን ከሚከተሉት አማራጮች ይምረጡ ወይም የሚፈልጉትን የምዝገባ፣ የግዢ፣ የክፍያ፣ የማድረሻ ወይም የስራ ሚናዎች (RBAC) ጥያቄ ይጻፉልኝ። እርሶን ለመርዳት ዝግጁ ነኝ!`
          : langCode === "om"
          ? `Maaloo gaaffii ykn oomisha barbaaddan barreessaa. Galmee, bittaa, kaffaltii, geejjiba fi gahee hojjettootaa (RBAC) irratti isin gargaaruuf qophiidha!`
          : `I'm happy to help you with anything across our platform! You can ask about account registration, buying gadgets, manual payments (CBE/Telebirr/BOA/Awash), delivery tracking, or platform roles.`
      }`,
      links: [
        { label: "🔐 Register & Buy Guide", to: "/products" },
        { label: "💳 Checkout", to: "/checkout" },
        { label: "📦 Track Orders", to: "/my-orders" },
        { label: "✉️ Contact Support", to: "/contact" },
      ],
    };
  };

  const handleSend = async (explicitText) => {
    const rawText = typeof explicitText === "string" ? explicitText : input;
    const trimmed = (rawText || "").trim();
    if (!trimmed && !attachedFile) return;

    const attachmentPayload = attachedFile ? { ...attachedFile } : null;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: trimmed || (attachmentPayload ? `[Attached File: ${attachmentPayload.name}]` : ""),
      attachment: attachmentPayload,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFile(null);
    setIsTyping(true);

    // 1. Try Live Google Gemini AI via backend endpoint
    try {
      const res = await API.post("/ai/chat", {
        message: trimmed || `[Attachment: ${attachmentPayload?.name || "file"}]`,
        language: langCode,
        history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      });

      if (res.data?.success && res.data?.reply) {
        const localResp = generateResponse(trimmed, attachmentPayload);
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: res.data.reply,
          model: res.data.model || "Gemini 3.1 Flash",
          products: localResp?.products || [],
          links: localResp?.links || [],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);

        if (!isOpen) {
          setUnreadCount((c) => c + 1);
        }
        return;
      }
    } catch (err) {
      console.warn("Live Gemini API call failed, falling back to local reasoning engine:", err.message);
    }

    // 2. Fallback to local high-precision reasoning engine
    setTimeout(() => {
      const response = generateResponse(trimmed, attachmentPayload);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: response.text,
        products: response.products || [],
        links: response.links || [],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentSuggestions = SUGGESTIONS[langCode] || SUGGESTIONS.en;

  return (
    <div className="ai-assistant-root">
      {/* ── VS Code Style Floating Launcher Button ── */}
      {!isOpen && (
        <button
          className="ai-vscode-launcher-btn"
          onClick={handleOpen}
          aria-label="Open AI Copilot"
          title="Open VS Code Tech Copilot"
        >
          <div className="ai-vscode-launcher-icon">
            <VscSparkle className="ai-vscode-sparkle" />
          </div>
          <div className="ai-vscode-launcher-labels">
            <span className="ai-vscode-launcher-tag">TECH COPILOT</span>
            <span className="ai-vscode-launcher-status">
              <span className="ai-vscode-live-dot" /> Online • System Guide
            </span>
          </div>
          {unreadCount > 0 && <span className="ai-vscode-unread-badge">{unreadCount}</span>}
        </button>
      )}

      {/* ── Active VS Code Extension Style Panel ── */}
      {isOpen && (
        <div className={`ai-vscode-chat-window ${isMinimized ? "minimized" : ""}`}>
          {/* VS Code Editor Panel Header */}
          <div className="ai-vscode-header">
            <div className="ai-vscode-header-left">
              <div className="ai-vscode-icon-box">
                <VscTerminal />
              </div>
              <div className="ai-vscode-header-titles">
                <span className="ai-vscode-main-title">TECH COPILOT // SYSTEM AI</span>
                <span className="ai-vscode-sub-title">
                  {isTyping ? "PROCESSING PROMPT..." : "READY // RBAC • PAYMENTS • ORDERS"}
                </span>
              </div>
            </div>

            <div className="ai-vscode-header-actions">
              <button
                type="button"
                className="ai-vscode-action-btn"
                onClick={handleClearHistory}
                title="Clear Session"
                aria-label="Clear chat"
              >
                <FaTrashAlt />
              </button>
              <button
                type="button"
                className="ai-vscode-action-btn"
                onClick={() => setIsMinimized((m) => !m)}
                title={isMinimized ? "Expand Panel" : "Minimize Panel"}
                aria-label="Toggle minimize"
              >
                <FaMinus />
              </button>
              <button
                type="button"
                className="ai-vscode-action-btn ai-vscode-close-btn"
                onClick={handleClose}
                title="Close Copilot"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div className="ai-vscode-chat-body">
                {/* Developer / System Status Bar */}
                <div className="ai-vscode-status-bar">
                  <span className="ai-vscode-status-code">MODEL: Gemini 2.5 Pro</span>
                  <span className="ai-vscode-status-badge">RBAC ACTIVE</span>
                  <span className="ai-vscode-status-badge">12 CATEGORIES</span>
                </div>

                {/* Message stream */}
                <div className="ai-vscode-messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`ai-vscode-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
                    >
                      <div className="ai-vscode-bubble-container">
                        <div className="ai-vscode-sender-tag">
                          {msg.sender === "user" ? "USER (You)" : "COPILOT AGENT"} &bull; {msg.time}
                        </div>

                        <div className={`ai-vscode-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                          {/* Attached file in message */}
                          {msg.attachment && (
                            <div className="ai-vscode-attached-pill">
                              {msg.attachment.isImage && msg.attachment.previewUrl ? (
                                <img
                                  src={msg.attachment.previewUrl}
                                  alt="attachment"
                                  className="ai-vscode-attached-thumb"
                                />
                              ) : (
                                <FaFileAlt className="ai-vscode-attached-icon" />
                              )}
                              <div className="ai-vscode-attached-meta">
                                <span className="ai-vscode-attached-name">{msg.attachment.name}</span>
                                <span className="ai-vscode-attached-size">({msg.attachment.size})</span>
                              </div>
                            </div>
                          )}

                          <div className="ai-vscode-message-content">
                            {msg.sender === "bot" ? renderFormattedText(msg.text) : msg.text}
                          </div>

                          {/* Dynamic In-Chat Product Cards */}
                          {msg.products && msg.products.length > 0 && (
                            <div className="ai-product-cards-grid">
                              {msg.products.map((p) => {
                                const imgSrc = p.image ? getImageUrl(p.image) : null;
                                const originalPrice = p.originalPrice || (p.price ? p.price * 1.15 : null);
                                return (
                                  <Link
                                    key={p._id}
                                    to={`/product/${p._id}`}
                                    className="ai-mini-card"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {imgSrc ? (
                                      <img src={imgSrc} alt={p.name} className="ai-mini-img" />
                                    ) : (
                                      <div className="ai-mini-placeholder">💻</div>
                                    )}
                                    <div className="ai-mini-details">
                                      <div className="ai-mini-name">{p.name}</div>
                                      <div className="ai-mini-pricing">
                                        <span className="ai-mini-price">
                                          {(p.discountPrice || p.price)?.toLocaleString()} ETB
                                        </span>
                                        {originalPrice && originalPrice > (p.discountPrice || p.price) && (
                                          <span className="ai-mini-original">
                                            {Math.round(originalPrice).toLocaleString()} ETB
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}

                          {/* Action Navigation Links */}
                          {msg.links && msg.links.length > 0 && (
                            <div className="ai-vscode-link-chips">
                              {msg.links.map((link, idx) => (
                                <Link
                                  key={idx}
                                  to={link.to}
                                  className="ai-vscode-link-chip"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing / Generating Indicator */}
                  {isTyping && (
                    <div className="ai-vscode-row bot-row">
                      <div className="ai-vscode-bubble-container">
                        <div className="ai-vscode-sender-tag">COPILOT AGENT &bull; Generating response...</div>
                        <div className="ai-vscode-bubble bot-bubble ai-vscode-typing-box">
                          <span className="ai-vscode-cursor">▋</span>
                          <span className="ai-vscode-thinking-text">Querying architecture graph...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Developer Quick Prompt Chips */}
                <div className="ai-vscode-suggestions-bar">
                  {currentSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-vscode-chip"
                      onClick={() => handleSend(s.query)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar with File Attachment */}
              <div className="ai-vscode-footer">
                {/* Active Staged Attachment Pill */}
                {attachedFile && (
                  <div className="ai-vscode-staged-box">
                    <div className="ai-vscode-staged-left">
                      {attachedFile.isImage ? (
                        <img
                          src={attachedFile.previewUrl}
                          alt="preview"
                          className="ai-vscode-staged-thumb"
                        />
                      ) : (
                        <FaFileAlt className="ai-vscode-staged-icon" />
                      )}
                      <span className="ai-vscode-staged-name">{attachedFile.name}</span>
                      <span className="ai-vscode-staged-size">({attachedFile.size})</span>
                    </div>
                    <button
                      type="button"
                      className="ai-vscode-staged-close"
                      onClick={handleRemoveAttachment}
                      title="Remove attachment"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                <form
                  className="ai-vscode-input-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.txt,.log,.json"
                  />

                  {/* Attachment Button */}
                  <button
                    type="button"
                    className={`ai-vscode-attach-btn ${attachedFile ? "has-file" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach screenshot, payment slip, or log file"
                    aria-label="Attach File"
                  >
                    <FaPaperclip />
                  </button>

                  <input
                    ref={chatInputRef}
                    type="text"
                    className="ai-vscode-input"
                    placeholder={
                      langCode === "am"
                        ? "ጥያቄ ወይም ፋይል ያስገቡ (ምዝገባ፣ ክፍያ፣ ማድረሻ፣ RBAC)..."
                        : langCode === "om"
                        ? "Gaaffii ykn faayila galchaa (galmee, kaffaltii, geejjiba)..."
                        : "Ask Copilot or attach receipt/logs (Auth, Payments, RBAC)..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <button
                    type="submit"
                    className={`ai-vscode-send-btn ${input.trim() || attachedFile ? "active" : ""}`}
                    disabled={!input.trim() && !attachedFile}
                    aria-label="Execute prompt"
                    title="Send Prompt (Enter)"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
