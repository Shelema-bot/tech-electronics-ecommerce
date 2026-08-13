import axios from "axios";

const CHAPA_URL = "https://api.chapa.co/v1";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://tech-electronics-backend.onrender.com";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://tech-electronics-ecommerce-frontend.onrender.com";


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
    const response = await axios.post(
      `${CHAPA_URL}/transaction/initialize`,
      {
        amount: Number(amount),
        currency: "ETB",
        email,
        first_name,
        last_name,
        tx_ref,
        callback_url: `${BACKEND_URL}/api/payments/verify?tx_ref=${tx_ref}`,
        return_url: `${FRONTEND_URL}/payment-success?tx_ref=${tx_ref}`,
        customization: {
          title: "Tech & Electronic Store",
          description: "Secure payment for your order",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // response.data is the Chapa JSON body
    console.log("Chapa Init Raw:", JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error) {
    console.log(
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
      }
    );

    console.log("Chapa Verify Raw:", JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error) {
    console.log(
      "Chapa Verify Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
