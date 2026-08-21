import logger from "../utils/logger.js";

/**
 * Centralized error handling middleware.
 * Must be registered as the LAST middleware in server.js:
 *   app.use(errorHandler);
 *
 * Handles:
 * - ApiError (operational errors with known status codes)
 * - Mongoose ValidationError
 * - Mongoose CastError (invalid ObjectId)
 * - JWT errors
 * - Generic server errors
 *
 * In production: never exposes stack traces or internal details.
 */
const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  // ── Log every error ──────────────────────────────────────────
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);
  if (!isProd) console.error(err.stack);

  // ── Mongoose: invalid ObjectId ───────────────────────────────
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  // ── Mongoose: duplicate key ──────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // ── Mongoose: validation error ───────────────────────────────
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  // ── JWT: expired token ───────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired. Please login again." });
  }

  // ── JWT: invalid token ───────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }

  // ── Operational ApiError ─────────────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      ...(err.errors?.length > 0 && { errors: err.errors }),
    });
  }

  // ── Unknown / programming error ──────────────────────────────
  return res.status(500).json({
    success: false,
    message: isProd ? "Something went wrong. Please try again." : err.message,
    ...(!isProd && { stack: err.stack }),
  });
};

export default errorHandler;
