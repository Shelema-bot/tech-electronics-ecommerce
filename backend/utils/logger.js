/**
 * Structured logger — wraps console methods with timestamps and levels.
 * In production, sensitive data (passwords, tokens, secrets) must
 * NEVER be passed to any logger method.
 *
 * Usage:
 *   logger.info("Server started on port 5000");
 *   logger.error("DB connection failed", error.message);
 *   logger.warn("Rate limit exceeded", { ip });
 */

const isProd = process.env.NODE_ENV === "production";

const timestamp = () => new Date().toISOString();

const logger = {
  info:  (msg, meta = "") => console.log(`[${timestamp()}] INFO  ${msg}`, meta || ""),
  warn:  (msg, meta = "") => console.warn(`[${timestamp()}] WARN  ${msg}`, meta || ""),
  error: (msg, meta = "") => console.error(`[${timestamp()}] ERROR ${msg}`, meta || ""),
  debug: (msg, meta = "") => { if (!isProd) console.log(`[${timestamp()}] DEBUG ${msg}`, meta || ""); },
};

export default logger;
