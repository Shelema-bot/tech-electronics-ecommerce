/**
 * Rate limiting middleware — implemented without external dependencies.
 * Uses a simple in-memory sliding window per IP.
 *
 * For production at scale, replace with `express-rate-limit` + Redis.
 *
 * Usage:
 *   import { authRateLimit, apiRateLimit } from "../middleware/rateLimit.middleware.js";
 *   router.post("/login", authRateLimit, loginController);
 */

const windows = new Map();

/**
 * Creates a rate limiter middleware.
 * @param {object} options
 * @param {number} options.windowMs    Time window in milliseconds
 * @param {number} options.max         Max requests per window per IP
 * @param {string} options.message     Error message when limit exceeded
 */
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = "Too many requests. Please try again later." }) => {
  return (req, res, next) => {
    const ip  = req.ip || req.connection.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    if (!windows.has(key)) {
      windows.set(key, { count: 1, start: now });
      return next();
    }

    const entry = windows.get(key);

    // Reset window if expired
    if (now - entry.start > windowMs) {
      windows.set(key, { count: 1, start: now });
      return next();
    }

    entry.count++;

    if (entry.count > max) {
      return res.status(429).json({ success: false, message });
    }

    next();
  };
};

// ── Pre-configured limiters ──────────────────────────────────────

/** Strict limiter for authentication endpoints (login, register, password reset) */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

/** Standard API limiter for general endpoints */
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 120,
  message: "Too many requests. Please slow down.",
});

/** Payment endpoints — extra strict */
export const paymentRateLimit = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  message: "Too many payment requests. Please wait before trying again.",
});

export default createRateLimiter;
