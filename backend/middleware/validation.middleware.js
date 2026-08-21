/**
 * Request validation middleware.
 *
 * Validates request body fields before business logic runs.
 * Returns 400 with descriptive errors immediately if validation fails.
 *
 * Usage:
 *   router.post("/login", validateLogin, loginController);
 *   router.post("/products", validateProduct, createProduct);
 */

const validate = (fields) => (req, res, next) => {
  const errors = [];

  for (const [fieldName, rules] of Object.entries(fields)) {
    const value = req.body[fieldName];

    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`${fieldName} is required`);
      continue;
    }

    if (value === undefined || value === null || value === "") continue;

    if (rules.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${fieldName} must be a valid email address`);
      }
    }

    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`);
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`${fieldName} must be at least ${rules.min}`);
    }

    if (rules.isNumeric && isNaN(Number(value))) {
      errors.push(`${fieldName} must be a number`);
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${rules.enum.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

// ── Pre-built validators ─────────────────────────────────────────

export const validateLogin = validate({
  email:    { required: true, type: "email" },
  password: { required: true, minLength: 6 },
});

export const validateRegister = validate({
  name:     { required: true, minLength: 2, maxLength: 50 },
  email:    { required: true, type: "email" },
  password: { required: true, minLength: 8 },
});

export const validateProduct = validate({
  name:     { required: true, minLength: 2, maxLength: 200 },
  price:    { required: true, isNumeric: true, min: 0 },
  category: { required: true },
});

export const validateOrder = validate({
  orderItems:     { required: true },
  shippingAddress: { required: true },
});

export const validatePayment = validate({
  orderId: { required: true },
  amount:  { required: true, isNumeric: true, min: 1 },
});

export default validate;
