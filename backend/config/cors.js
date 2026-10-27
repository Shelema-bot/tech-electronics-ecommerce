/**
 * CORS configuration — extracted from server.js for clarity.
 * Allows Vercel frontend deployments, local development, and dynamic FRONTEND_URL.
 */

export const allowedOrigins = [
  "https://tech-electronics-ecommerce-frontend.vercel.app",
  "https://e-commerce-techstore.vercel.app",
  "https://tech-electronics-ecommerce-frontend-git-main-tech-electronics.vercel.app",
  "https://tech-electronics-ecommerce-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((url) => url.replace(/\/+$/, ""));

export const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, server-to-server, curl)
  const clean = origin.replace(/\/+$/, "");
  return (
    allowedOrigins.includes(clean) ||
    clean.endsWith(".vercel.app") ||
    clean.includes("localhost") ||
    clean.includes("127.0.0.1")
  );
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

export default corsOptions;


