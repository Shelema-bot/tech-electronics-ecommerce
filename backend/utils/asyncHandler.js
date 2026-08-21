/**
 * asyncHandler — wraps an async Express route handler and forwards any
 * rejected promise to the next() error middleware.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 *
 * Eliminates repetitive try/catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
