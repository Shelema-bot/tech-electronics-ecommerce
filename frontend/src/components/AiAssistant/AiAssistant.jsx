import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePreference } from "../../context/PreferenceContext";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaSearch,
  FaTrashAlt,
  FaMinus,
  FaLaptop,
  FaMobileAlt,
  FaCreditCard,
  FaTruck,
  FaPercent,
  FaShieldAlt,
} from "react-icons/fa";
import "./AiAssistant.css";

// ── Multi-language Default Greetings & Responses ─────────────────────────────
const GREETINGS = {
  en: "Hello! 👋 I'm your Tech AI Shopping Assistant. How can I help you find gadgets, check tech specs, or guide your payment today?",
  am: "ሰላም! 👋 እኔ የእርስዎ የቴክ ኢ-ኮሜርስ AI ረዳት ነኝ። ዛሬ በላፕቶፖች፣ ስልኮች፣ ዋጋዎች ወይም ክፍያዎች ላይ እንዴት ልርዳዎት?",
  om: "Akkam! 👋 Ani gargaaraa AI Tech E-Commerce keessani. Har'a laaptooppii, bilbila, gatii fi kaffaltii irratti akkamitti isin gargaaruu danda'a?",
};

const SUGGESTIONS = {
  en: [
    { label: "💻 Best Laptops", query: "Show me best laptops for work & gaming" },
    { label: "📱 Latest Smartphones", query: "What smartphones are available?" },
    { label: "💳 Payment Methods", query: "How do I pay with Telebirr or CBE Birr?" },
    { label: "🚚 Delivery & Shipping", query: "What is your shipping policy and delivery time?" },
    { label: "🔥 Deals & Discounts", query: "Are there any special discounts right now?" },
  ],
  am: [
    { label: "💻 ምርጥ ላፕቶፖች", query: "ምርጥ ላፕቶፖችን አሳየኝ" },
    { label: "📱 አዳዲስ ስልኮች", query: "ምን ስልኮች ይገኛሉ?" },
    { label: "💳 የክፍያ መንገዶች", query: "በቴሌብር ወይም በሲቢኢ ብር እንዴት እከፍላለሁ?" },
    { label: "🚚 ማድረሻ መረጃ", query: "ማድረሻ ምን ያህል ጊዜ ይወስዳል?" },
    { label: "🔥 ቅናሾች", query: "ያሉ ልዩ ቅናሾች ምንድናቸው?" },
  ],
  om: [
    { label: "💻 Laaptooppii Gaarii", query: "Laaptooppii hojii fi geemiif ta'u na agarsiisi" },
    { label: "📱 Bilbiloota Haaraa", query: "Bilbilli dhiheenyatti jiru maali?" },
    { label: "💳 Kaffaltii Telebirr & CBE", query: "Telebirr fi CBE kaffaltiin akkamitti raawwatama?" },
    { label: "🚚 Yeroo Geejjibaa", query: "Geejjibni yeroo hangam fudhata?" },
    { label: "🔥 Hir'ina Gatii", query: "Gatiin hir'ifame maaltu jira?" },
  ],
};

export default function AiAssistant() {
  const { t } = useTranslation();
  const { language } = usePreference();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [productsCatalog, setProductsCatalog] = useState([]);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const langCode = (language?.code || "en").toLowerCase();

  // Load products catalog once for intelligent in-chat search & recommendations
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

  // Initialize or update initial message when language changes
  useEffect(() => {
    const saved = sessionStorage.getItem("ai_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) {
        // fall through to default
      }
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

  // Persist messages across pages
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("ai_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Hide on admin routes so it doesn't conflict with staff dashboard
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

  // ── AI Response Generation Engine ──────────────────────────────────────────
  const generateResponse = (userText) => {
    const q = userText.toLowerCase().trim();

    // 1. Payment Questions
    if (
      q.includes("pay") ||
      q.includes("telebirr") ||
      q.includes("cbe") ||
      q.includes("chapa") ||
      q.includes("bank") ||
      q.includes("ክፍያ") ||
      q.includes("ቴሌብር") ||
      q.includes("ሲቢኢ") ||
      q.includes("kaffaltii") ||
      q.includes("baankii")
    ) {
      if (langCode === "am") {
        return {
          text: `💳 **የክፍያ አማራጮችና መመሪያዎች:**
1. **Chapa (ቀጥታ ክፍያ):** በካርድ ወይም በሞባይል ባንኪንግ ወዲያውኑ ትዕዛዝዎን ያረጋግጡ።
2. **Telebirr (ቴሌብር):** ወደ ይፋዊ የንግድ መለያችን ክፍያ ፈጽመው ደረሰኝ በቼክአውት ገጽ ይላኩ።
3. **CBE Birr እና የባንክ ማስተላለፍ:** የኢትዮጵያ ንግድ ባንክ (CBE)፣ አቢሲኒያ ወይም አዋሽ ባንክ ደረሰኝ ፎቶ በማያያዝ ማረጋገጫ ያግኙ።
4. **ጥሬ ገንዘብ ሲረከቡ (COD):** በአዲስ አበባ እና በተመረጡ ከተሞች ሲደርስዎ ይክፈሉ።`,
          links: [
            { label: "💳 ወደ ቼክአውት ይሂዱ", to: "/cart" },
            { label: "❓ የተደጋጋሚ ጥያቄዎች (FAQ)", to: "/faq" },
          ],
        };
      }
      if (langCode === "om") {
        return {
          text: `💳 **Filannoowwan Kaffaltii & Qajeelfama:**
1. **Chapa (Kaffaltii Battalaa):** Kaardii ykn baankii moobaayilaatiin battalatti kaffalaa.
2. **Telebirr:** Lakkoofsa daldalaa keenyatti erga kaffaltanii booda nagahee fuula checkout irratti fe'aa.
3. **CBE Birr & Dabarsa Baankii:** Nagahee Baankii Daldala Itiyoophiyaa, Abisiiniyaa ykn Awaash qabsiisuun mirkaneeffadhaa.
4. **Yeroo Geejjibaa Kaffaluu (COD):** Finfinnee keessatti yeroo meeshaan isin ga'u kaffaluu dandeessu.`,
          links: [
            { label: "💳 Gara Kuusaa Bittaa", to: "/cart" },
            { label: "❓ Gaaffilee Yeroo Baay'ee (FAQ)", to: "/faq" },
          ],
        };
      }
      return {
        text: `💳 **Accepted Payment Methods & Step-by-Step Instructions:**
1. **Chapa (Instant Card & Mobile):** Pay instantly with Debit/Credit Card or mobile wallets with real-time checkout confirmation.
2. **Telebirr & CBE Birr:** Transfer funds to our official merchant account and upload your payment proof screenshot during checkout.
3. **Bank Transfer:** Commercial Bank of Ethiopia (CBE), Bank of Abyssinia (BOA), or Awash Bank. Upload your slip/transaction number.
4. **Cash on Delivery (COD):** Available in Addis Ababa and selected regional cities. Pay securely when your package arrives!`,
        links: [
          { label: "💳 View Cart / Checkout", to: "/cart" },
          { label: "❓ Read Payment FAQ", to: "/faq" },
        ],
      };
    }

    // 2. Shipping & Delivery
    if (
      q.includes("shipping") ||
      q.includes("delivery") ||
      q.includes("arrive") ||
      q.includes("track") ||
      q.includes("ማድረሻ") ||
      q.includes("መላኪያ") ||
      q.includes("geejjiba") ||
      q.includes("yoom")
    ) {
      if (langCode === "am") {
        return {
          text: `🚚 **የማድረሻ ጊዜ እና መመሪያ:**
• **አዲስ አበባ:** ከ1 እስከ 2 ቀናት ውስጥ በታማኝ አድራሾቻችን በርዎ ድረስ ይደርሳል።
• **ክልል ከተሞች:** ከ3 እስከ 5 ቀናት ውስጥ በፈጣን ፖስታ ወይም ካርጎ ይደርሳል።
• ትዕዛዝዎን በማንኛውም ጊዜ በ **የእኔ ትዕዛዞች (My Orders)** ገጽ ላይ መከታተል ይችላሉ።`,
          links: [
            { label: "📦 ትዕዛዞቼን እይ", to: "/my-orders" },
            { label: "🚚 የማድረሻ ፖሊሲ", to: "/shipping-info" },
          ],
        };
      }
      return {
        text: `🚚 **Shipping & Fast Doorstep Delivery Details:**
• **Addis Ababa:** 1–2 business days direct delivery to your doorstep.
• **Regional Cities:** 3–5 business days via verified domestic express parcel & cargo services.
• You can track live shipment progress anytime on your **My Orders** page. All electronics are securely packaged with tamper-proof seals.`,
        links: [
          { label: "📦 Track My Orders", to: "/my-orders" },
          { label: "🚚 Full Shipping Policy", to: "/shipping-info" },
        ],
      };
    }

    // 3. Warranty & Returns
    if (
      q.includes("return") ||
      q.includes("refund") ||
      q.includes("warranty") ||
      q.includes("broken") ||
      q.includes("ዋስትና") ||
      q.includes("መመለስ") ||
      q.includes("wabiin")
    ) {
      if (langCode === "am") {
        return {
          text: `🛡️ **የዋስትና እና የመመለሻ መመሪያ:**
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
          text: `🛡️ **Wabiin fi Haala Deebii Meeshaa:**
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
        text: `🛡️ **Warranty & Guarantee Coverage:**
• **1-Year Brand Warranty:** Every laptop, smartphone, tablet, and smart device comes with an official 1-year brand warranty.
• **30-Day Hassle-Free Returns:** If your product arrives defective or doesn't match specifications, initiate a return within 30 days for an exchange or full refund.
• 100% Genuine: All items are factory sealed and sourced directly from authorized manufacturers.`,
        links: [
          { label: "↩️ Return Policy", to: "/returns" },
          { label: "✉️ Contact Support", to: "/contact" },
        ],
      };
    }

    // 4. Become a Seller / Merchant Inquiries
    if (
      q.includes("seller") ||
      q.includes("vendor") ||
      q.includes("merchant") ||
      q.includes("sell") ||
      q.includes("ሻጭ") ||
      q.includes("መሸጥ") ||
      q.includes("gurguruu") ||
      q.includes("gurgurtuu")
    ) {
      if (langCode === "am") {
        return {
          text: `✨ **በቴክ ኢ-ኮሜርስ ላይ ሻጭ ለመሆን:**
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
        text: `✨ **How to Become a Verified Merchant / Seller:**
1. Visit the **Become a Seller** page.
2. Provide your Business / Store Name and upload a clear photo of your National ID / Trade document.
3. Once reviewed and approved by the store Owner (Shelema), your merchant portal unlocks, and you can upload tech products to thousands of shoppers!`,
        links: [
          { label: "✨ Apply as Seller", to: "/become-seller" },
          { label: "✉️ Contact Partner Team", to: "/contact" },
        ],
      };
    }

    // 5. Order Tracking & Status
    if (
      q.includes("order") ||
      q.includes("track") ||
      q.includes("status") ||
      q.includes("ትዕዛዝ") ||
      q.includes("የት ደረሰ") ||
      q.includes("ajaja") ||
      q.includes("hordof")
    ) {
      return {
        text: `📦 **Order Tracking & Fulfillment Lifecycle:**
• **Pending:** Order placed, awaiting payment confirmation / review.
• **Processing:** Payment approved, items being quality checked and securely packaged.
• **Shipped:** Handed over to our delivery dispatch team with live tracking.
• **Delivered:** Arrived at your destination!`,
        links: [
          { label: "📦 View My Orders", to: "/my-orders" },
          { label: "💳 View Payment History", to: "/payment-history" },
        ],
      };
    }

    // 6. Product Search with Budget Filter
    const budgetMatch = q.match(/(?:under|below|less than|gadani|በታች)\s*(\d+[\d,]*)/i) ||
                        q.match(/(\d+[\d,]*)\s*(?:etb|birr|ብር)?\s*(?:በታች|gadani|under|below)/i);
    const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ""), 10) : null;

    const matchedProducts = productsCatalog.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const price = p.discountPrice || p.price || 0;

      const matchesText =
        name.includes(q) ||
        cat.includes(q) ||
        desc.includes(q) ||
        (q.includes("laptop") && cat.includes("laptop")) ||
        (q.includes("phone") && cat.includes("phone")) ||
        (q.includes("gaming") && (cat.includes("gaming") || name.includes("gaming"))) ||
        (q.includes("watch") && cat.includes("watch")) ||
        (q.includes("headphone") && cat.includes("headphone")) ||
        (q.includes("audio") && cat.includes("audio")) ||
        (q.includes("drone") && cat.includes("drone")) ||
        (q.includes("camera") && cat.includes("camera")) ||
        (q.includes("tablet") && cat.includes("tablet")) ||
        (q.includes("printer") && cat.includes("printer"));

      if (maxBudget && matchesText) {
        return price <= maxBudget;
      }
      return matchesText;
    });

    if (matchedProducts.length > 0) {
      const top3 = matchedProducts.slice(0, 3);
      return {
        text: maxBudget
          ? `✨ Found **${matchedProducts.length} product(s)** under **${maxBudget.toLocaleString()} ETB**: Here are top recommendations:`
          : `✨ I found **${matchedProducts.length} matching item(s)** in our catalog! Here are top recommendations:`,
        products: top3,
        links: [{ label: "🛍️ View Full Catalog", to: "/products" }],
      };
    }

    // 5. General Tech Specs Advice
    if (q.includes("ram") || q.includes("ssd") || q.includes("m2") || q.includes("m3") || q.includes("intel") || q.includes("spec")) {
      return {
        text: `⚙️ **Tech Specs Recommendation:**
• **Students & Office Work:** Intel Core i5 or Ryzen 5 with **8GB RAM + 512GB SSD** is perfect for fast multitasking.
• **Software Engineers & Creators:** Intel Core i7 / Apple M2/M3 with **16GB+ RAM + 1TB NVMe SSD** for seamless coding & rendering.
• **Gamers:** Look for dedicated RTX 3060/4060+ GPUs and high refresh-rate 144Hz displays. Check our Gaming category for deals!`,
        links: [{ label: "💻 Explore Laptops", to: "/products?category=Laptops" }],
      };
    }

    // 6. Default Fallback
    return {
      text:
        langCode === "am"
          ? `እባክዎን ከሚከተሉት አማራጮች ይምረጡ ወይም የሚፈልጉትን የቴክኖሎጂ ምርት፣ ስልክ፣ ላፕቶፕ ወይም የክፍያ ጥያቄ ይጻፉልኝ። እርሶን ለመርዳት ዝግጁ ነኝ!`
          : langCode === "om"
          ? `Maaloo gaaffii ykn oomisha barbaaddan barreessaa. Laaptooppii, bilbila, kaffaltii fi geejjiba irratti isin gargaaruuf qophiidha!`
          : `I'm happy to help you with anything tech! You can search products, compare specifications, ask about Telebirr/Chapa payments, or check delivery times.`,
      links: [
        { label: "💻 Browse Laptops", to: "/products?category=Laptops" },
        { label: "📱 Browse Smartphones", to: "/products?category=Smartphones" },
        { label: "🛒 View All Products", to: "/products" },
        { label: "✉️ Contact Support", to: "/contact" },
      ],
    };
  };

  const handleSend = (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Realistic AI thinking delay (400-800ms)
    setTimeout(() => {
      const response = generateResponse(trimmed);
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
    }, 600);
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
      {/* ── Floating Launcher Bubble ── */}
      {!isOpen && (
        <button
          className="ai-launcher-btn"
          onClick={handleOpen}
          aria-label="Open AI Shopping Assistant"
          title="Chat with Tech AI Assistant"
        >
          <div className="ai-launcher-icon-wrap">
            <FaRobot className="ai-robot-icon" />
            <span className="ai-pulse-ring" />
          </div>
          <div className="ai-launcher-label">
            <span className="ai-launcher-title">Tech AI</span>
            <span className="ai-launcher-sub">Shopping Agent</span>
          </div>
          {unreadCount > 0 && <span className="ai-launcher-badge">{unreadCount}</span>}
        </button>
      )}

      {/* ── Active Chat Window / Drawer ── */}
      {isOpen && (
        <div className={`ai-chat-window ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-avatar-badge">
                <FaRobot />
                <span className="ai-online-dot" />
              </div>
              <div className="ai-header-info">
                <h3 className="ai-header-name">Tech AI Assistant</h3>
                <span className="ai-header-status">
                  {isTyping ? "Typing..." : "Online • Ready to help"}
                </span>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-action-btn"
                onClick={handleClearHistory}
                title="Clear chat history"
                aria-label="Clear chat"
              >
                <FaTrashAlt />
              </button>
              <button
                type="button"
                className="ai-action-btn"
                onClick={() => setIsMinimized((m) => !m)}
                title={isMinimized ? "Expand" : "Minimize"}
                aria-label="Toggle minimize"
              >
                <FaMinus />
              </button>
              <button
                type="button"
                className="ai-action-btn ai-close-btn"
                onClick={handleClose}
                title="Close chat"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div className="ai-chat-body">
                {/* Security & Authenticity Banner */}
                <div className="ai-trust-pill">
                  <FaShieldAlt /> 100% Genuine Tech • Instant Support & Specs
                </div>

                {/* Message stream */}
                <div className="ai-messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`ai-message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
                    >
                      {msg.sender === "bot" && (
                        <div className="ai-bot-avatar">
                          <FaRobot />
                        </div>
                      )}

                      <div className="ai-bubble-wrap">
                        <div
                          className={`ai-message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
                        >
                          <div className="ai-message-text" style={{ whiteSpace: "pre-line" }}>
                            {msg.text}
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

                          {/* Action Links */}
                          {msg.links && msg.links.length > 0 && (
                            <div className="ai-bubble-links">
                              {msg.links.map((link, idx) => (
                                <Link
                                  key={idx}
                                  to={link.to}
                                  className="ai-bubble-link-chip"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="ai-message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="ai-message-row bot-row">
                      <div className="ai-bot-avatar">
                        <FaRobot />
                      </div>
                      <div className="ai-bubble-wrap">
                        <div className="ai-message-bubble bot-bubble ai-typing-bubble">
                          <span className="ai-typing-dot" />
                          <span className="ai-typing-dot" />
                          <span className="ai-typing-dot" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="ai-suggestions-row">
                  {currentSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-suggestion-chip"
                      onClick={() => handleSend(s.query)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="ai-chat-footer">
                <input
                  ref={chatInputRef}
                  type="text"
                  className="ai-chat-input"
                  placeholder={
                    langCode === "am"
                      ? "ስለ ምርቶች ወይም ክፍያዎች ይጠይቁ..."
                      : langCode === "om"
                      ? "Waa'ee oomishaa ykn kaffaltii gaafadhaa..."
                      : "Ask AI about laptops, phones, payments..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className={`ai-send-btn ${input.trim() ? "active" : ""}`}
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  aria-label="Send Message"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
