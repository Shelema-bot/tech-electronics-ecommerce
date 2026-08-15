import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import {
  initializeChapaPayment,
  verifyChapaPayment,
} from "../services/chapaService.js";
import { sendPaymentConfirmation } from "../utils/sendEmail.js";


// ===============================
// Initialize Payment
// ===============================

export const initializePayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and amount are required",
      });
    }

    // Verify order belongs to this user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const tx_ref = "TX-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

    const names = req.user.name.trim().split(" ");
    const firstName = names[0] || "Customer";
    const lastName = names.slice(1).join(" ") || "User";

    // Call Chapa — returns response.data (the parsed JSON body from Chapa)
    const chapaData = await initializeChapaPayment({
      amount,
      email: req.user.email,
      first_name: firstName,
      last_name: lastName,
      tx_ref,
    });

    console.log("CHAPA INIT RESPONSE:", JSON.stringify(chapaData, null, 2));

    // Chapa returns: { message, status, data: { checkout_url } }
    const checkoutUrl =
      chapaData?.data?.checkout_url ||
      chapaData?.checkout_url;

    if (!checkoutUrl) {
      console.log("No checkout_url in Chapa response:", chapaData);
      return res.status(500).json({
        success: false,
        message: "Chapa did not return a checkout URL",
        chapaResponse: chapaData,
      });
    }

    // Save payment record
    await Payment.create({
      order: orderId,
      user: req.user._id,
      amount,
      tx_ref,
      status: "Pending",
    });

    return res.json({
      success: true,
      message: "Payment initialized",
      checkout_url: checkoutUrl,
      tx_ref,
    });

  } catch (error) {
    console.log(
      "PAYMENT INIT ERROR:",
      error.response?.data || error.message
    );

    // Chapa returns error details in error.response.data
    const chapaError = error.response?.data;
    let errorMsg = "Payment initialization failed. Please check your details and try again.";

    if (typeof chapaError?.message === "string") {
      errorMsg = chapaError.message;
    } else if (chapaError?.message && typeof chapaError.message === "object") {
      // Chapa sometimes returns message as { field: ["error"] }
      const firstKey = Object.keys(chapaError.message)[0];
      errorMsg = `${firstKey}: ${chapaError.message[firstKey]?.[0] || "invalid"}`;
    }

    return res.status(500).json({
      success: false,
      message: errorMsg,
    });
  }
};


// ===============================
// Verify Payment
// ===============================

export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.query;

    console.log("VERIFY TX REF:", tx_ref);

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference required",
      });
    }

    // Verify with Chapa
    const chapaData = await verifyChapaPayment(tx_ref);
    console.log("CHAPA VERIFY RESPONSE:", JSON.stringify(chapaData, null, 2));

    // Find payment record
    const payment = await Payment.findOne({ tx_ref });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Chapa success: { status: "success", data: { status: "success" } }
    const isSuccess =
      (chapaData?.status === "success" && chapaData?.data?.status === "success") ||
      chapaData?.data?.status === "success";

    if (isSuccess) {
      payment.status = "Paid";
      payment.paidAt = new Date();
      await payment.save();

      // Mark order as paid
      const order = await Order.findById(payment.order);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
      }

      // Send payment confirmation email
      const user = await User.findById(payment.user).select("name email");
      if (user) {
        sendPaymentConfirmation(payment, user.email, user.name);
      }

      return res.json({
        success: true,
        message: "Payment completed successfully",
      });
    }

    return res.json({
      success: false,
      message: "Payment not completed yet",
      chapaStatus: chapaData?.data?.status,
    });

  } catch (error) {
    console.log(
      "VERIFY PAYMENT ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
