import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

export const getAdminReports = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const paidPayments = await Payment.find({
      status: "Paid",
    });

    const totalRevenue = paidPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const pendingPayments = await Payment.countDocuments({
      status: "Pending",
    });

    // Orders grouped by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
    ]);

    // Products grouped by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
    ]);

    // Monthly sales
    const monthlySales = await Payment.aggregate([
      {
        $match: {
          status: "Paid",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      pendingPayments,
      ordersByStatus,
      productsByCategory,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};