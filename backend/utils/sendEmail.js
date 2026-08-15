import nodemailer from "nodemailer";

// Create transporter — uses Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
};

// ─── Send order confirmation to customer ─────────────────────────
export const sendOrderConfirmation = async (order, userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const itemsHtml = order.orderItems
      ?.map(
        (item) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #f1f5f9;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;">${(item.price * item.quantity).toLocaleString()} ETB</td>
          </tr>`
      )
      .join("");

    await transporter.sendMail({
      from: `"Tech & Electronic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Order Confirmed — ${order._id}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
          <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">⚡ Tech & Electronic</h1>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <h2 style="color:#16a34a;margin-top:0;">Order Confirmed! 🎉</h2>
            <p style="color:#475569;">Hi <strong>${userName}</strong>, your order has been placed successfully.</p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#64748b;">Order ID</p>
              <p style="margin:4px 0 0;font-weight:700;color:#0f172a;font-family:monospace;">${order._id}</p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#64748b;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b;text-transform:uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="text-align:right;padding:16px 8px;border-top:2px solid #e2e8f0;">
              <span style="font-size:18px;font-weight:800;color:#0f172a;">Total: ${order.totalPrice?.toLocaleString()} ETB</span>
            </div>

            <div style="background:#eff6ff;border-radius:8px;padding:16px;margin-top:20px;">
              <p style="margin:0;color:#1d4ed8;font-size:14px;">📦 <strong>Payment:</strong> ${order.paymentMethod || "Chapa Payment"}</p>
              <p style="margin:6px 0 0;color:#1d4ed8;font-size:14px;">🚚 <strong>Status:</strong> ${order.status || "Processing"}</p>
            </div>

            <p style="color:#64748b;margin-top:24px;font-size:14px;">Thank you for shopping with us! If you have any questions, reply to this email.</p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Tech & Electronic E-Commerce</p>
        </div>
      `,
    });

    console.log(`✅ Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.log("Email error (order):", error.message);
    // Don't throw — email failure shouldn't break the order
  }
};

// ─── Send payment confirmation to customer ───────────────────────
export const sendPaymentConfirmation = async (payment, userEmail, userName) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Tech & Electronic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `💳 Payment Successful — ${payment.tx_ref}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
          <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">⚡ Tech & Electronic</h1>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 12px 12px;">
            <h2 style="color:#16a34a;margin-top:0;">Payment Confirmed! ✅</h2>
            <p style="color:#475569;">Hi <strong>${userName}</strong>, your payment has been received.</p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#64748b;font-size:13px;">Transaction Ref</span>
                <span style="font-family:monospace;font-weight:700;color:#0f172a;">${payment.tx_ref}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <span style="color:#64748b;font-size:13px;">Amount</span>
                <span style="font-weight:800;color:#16a34a;font-size:18px;">${payment.amount?.toLocaleString()} ETB</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#64748b;font-size:13px;">Status</span>
                <span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">PAID</span>
              </div>
            </div>

            <p style="color:#64748b;font-size:14px;">Your order is now being processed and will be delivered soon.</p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Tech & Electronic E-Commerce</p>
        </div>
      `,
    });

    console.log(`✅ Payment confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.log("Email error (payment):", error.message);
  }
};

// ─── Notify admin of new order ───────────────────────────────────
export const notifyAdminNewOrder = async (order, userName) => {
  try {
    if (!process.env.ADMIN_EMAIL) return;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Tech & Electronic" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order from ${userName}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#0f172a;">New Order Received</h2>
          <p><strong>Customer:</strong> ${userName}</p>
          <p><strong>Order ID:</strong> <code>${order._id}</code></p>
          <p><strong>Total:</strong> ${order.totalPrice?.toLocaleString()} ETB</p>
          <p><strong>Items:</strong> ${order.orderItems?.length} product(s)</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
          <a href="${process.env.FRONTEND_URL || "https://tech-electronics-ecommerce-frontend.onrender.com"}/admin/orders"
             style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px;">
            View Order
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.log("Admin email error:", error.message);
  }
};
