import axios from "axios";

const CHAPA_URL = "https://api.chapa.co/v1";

export const getBackendUrl = () => {
  const url = process.env.BACKEND_URL || "https://tech-electronics-backend.onrender.com";
  return url.replace(/\/+$/, "");
};

export const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || "https://tech-electronics-ecommerce-frontend.vercel.app";
  return url.replace(/\/+$/, "");
};

export const isChapaConfigured = () => {
  const key = process.env.CHAPA_SECRET_KEY;
  return Boolean(
    key &&
    key.trim() &&
    !key.includes("your_chapa_secret_key") &&
    key !== "your_chapa_secret_key"
  );
};


// ================================
// Initialize Chapa Payment
// Returns the parsed Chapa JSON body:
// { message, status, data: { checkout_url } }
// ================================
export const initializeChapaPayment = async ({
  amount,
  email,
  first_name,
  last_name,
  tx_ref,
}) => {
  try {
    const backendUrl = getBackendUrl();
    const frontendUrl = getFrontendUrl();

    const response = await axios.post(
      `${CHAPA_URL}/transaction/initialize`,
      {
        amount: Number(amount),
        currency: "ETB",
        email: email || "customer@example.com",
        first_name: first_name || "Customer",
        last_name:  last_name || "User",
        tx_ref,
        callback_url: `${backendUrl}/api/payment/verify/${tx_ref}`,
        return_url: `${frontendUrl}/payment-success?tx_ref=${tx_ref}`,
        customization: {
          title: "Tech Electronics Store",
          description: `Order Payment for ${tx_ref}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("Chapa Init Raw:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(
      "Chapa Initialize Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ================================
// Verify Chapa Payment
// Returns the parsed Chapa JSON body:
// { message, status, data: { status: "success"|"failed" } }
// ================================
export const verifyChapaPayment = async (tx_ref) => {
  try {
    const response = await axios.get(
      `${CHAPA_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
        timeout: 10000,
      }
    );

    console.log("Chapa Verify Raw:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(
      "Chapa Verify Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

