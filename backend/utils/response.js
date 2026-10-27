/**
 * Standardized API response helpers.
 *
 * All responses follow:
 *   Success: { success: true,  message, data }
 *   Error:   { success: false, message, errors? }
 *
 * Usage in controllers:
 *   return sendSuccess(res, "Product retrieved", product);
 *   return sendError(res, 404, "Product not found");
 */

export const sendSuccess = (res, message = "Success", data = null, statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

export const sendError = (res, statusCode = 500, message = "Server Error", errors = []) => {
  const body = { success: false, message };
  if (errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const sendCreated = (res, message = "Created successfully", data = null) =>
  sendSuccess(res, message, data, 201);
