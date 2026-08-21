/**
 * ApiError — custom error class that carries an HTTP status code.
 *
 * Usage:
 *   throw new ApiError(404, "Product not found");
 *   throw new ApiError(403, "Access denied");
 *
 * The centralized error middleware in errorHandler.js reads
 * err.statusCode and err.message to send a consistent response.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode  HTTP status code (e.g. 400, 401, 403, 404, 500)
   * @param {string} message     Human-readable error message
   * @param {Array}  errors      Optional array of validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors     = errors;
    this.isOperational = true; // marks this as a known, handled error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
