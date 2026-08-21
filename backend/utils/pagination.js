/**
 * Pagination helper for Mongoose queries.
 *
 * Usage:
 *   const { page, limit, skip } = getPagination(req.query);
 *   const products = await Product.find(filter).skip(skip).limit(limit);
 *   return sendSuccess(res, "Products fetched", {
 *     products,
 *     ...getPaginationMeta(total, page, limit)
 *   });
 */

export const getPagination = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

export const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
