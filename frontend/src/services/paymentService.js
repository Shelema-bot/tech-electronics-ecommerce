import API from "../api/axios";

/**
 * Fetch enabled payment methods (Chapa, COD, CBE Birr, Telebirr, etc.)
 */
export const getPaymentMethods = async () => {
  try {
    const response = await API.get("/payment/methods");
    return response.data;
  } catch (error) {
    // Fallback to payments route if needed
    const response = await API.get("/payments/methods");
    return response.data;
  }
};

/**
 * Create order with status 'Pending'
 */
export const createOrder = async (orderData) => {
  const response = await API.post("/orders", orderData);
  return response.data;
};

/**
 * Initialize payment with gateway (Chapa / COD / Manual)
 * @param {Object} payload - { orderId, methodCode, customer, amount }
 */
export const initializePayment = async (payload) => {
  const response = await API.post("/payment/initialize", payload);
  return response.data;
};

/**
 * Verify payment with gateway via tx_ref
 * @param {string} tx_ref
 */
export const verifyPayment = async (tx_ref) => {
  const response = await API.get(`/payment/verify/${encodeURIComponent(tx_ref)}`);
  return response.data;
};

/**
 * Submit manual payment receipt / proof
 */
export const submitPaymentProof = async (paymentId, formData) => {
  const response = await API.put(`/payments/${paymentId}/proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Fetch order details by order ID
 */
export const getOrderById = async (orderId) => {
  const response = await API.get(`/orders/${orderId}`);
  return response.data;
};

// Kept for backward compatibility
export const getProductsByCategory = async (category) => {
  const response = await API.get(`/products/category/${category}`);
  return response.data;
};

