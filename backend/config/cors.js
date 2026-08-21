/**
 * CORS configuration — extracted from server.js for clarity.
 * Add new allowed origins here without touching server.js.
 */

const allowedOrigins = [
  "https://tech-electronics-ecommerce-frontend.vercel.app",
  "https://tech-electronics-ecommerce-frontend-git-main-tech-electronics.vercel.app",
  "https://tech-electronics-ecommerce-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / server-to-server (no Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
};

export default corsOptions;
