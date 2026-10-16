/**
 * CORS configuration — extracted from server.js for clarity.
 * Supports production Vercel frontend, local development, and dynamic FRONTEND_URL.
 */

const baseOrigins = [
  "https://tech-electronics-ecommerce-frontend.vercel.app",
  "https://tech-electronics-ecommerce-frontend-git-main-tech-electronics.vercel.app",
  "https://tech-electronics-ecommerce-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / server-to-server / curl (no Origin header)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");

    // Dynamic origin from environment variable
    const envFrontend = process.env.FRONTEND_URL?.replace(/\/+$/, "");
    if (envFrontend && normalizedOrigin === envFrontend) {
      return callback(null, true);
    }

    // Direct match against base origins
    if (baseOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments for this project
    if (
      normalizedOrigin.startsWith("https://tech-electronics-ecommerce-frontend") &&
      normalizedOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

export default corsOptions;

