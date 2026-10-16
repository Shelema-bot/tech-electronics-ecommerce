/**
 * seedSellerPlans.js — seeds 3 default seller subscription plans.
 * Run: node seedSellerPlans.js
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose     from "mongoose";
import SellerPlan    from "./models/SellerPlan.js";

const PLANS = [
  {
    name:         "Starter",
    description:  "Perfect for new sellers just getting started",
    color:        "#2563eb",
    icon:         "🚀",
    monthlyFee:   0,
    billingCycle: "monthly",
    trialDays:    0,
    productLimit: 10,
    minProductPrice: 0,
    maxProductPrice: 0,
    commissionRate: 10,
    features: [
      "List up to 10 products per month",
      "10% commission on each sale",
      "Basic seller dashboard",
      "Email support",
    ],
    isActive: true,
    displayOrder: 1,
  },
  {
    name:         "Pro",
    description:  "For growing sellers who need more listings and lower fees",
    color:        "#7c3aed",
    icon:         "⚡",
    monthlyFee:   500,
    billingCycle: "monthly",
    trialDays:    7,
    productLimit: 50,
    minProductPrice: 0,
    maxProductPrice: 0,
    commissionRate: 5,
    features: [
      "List up to 50 products per month",
      "5% commission on each sale",
      "Advanced seller dashboard with analytics",
      "Priority email support",
      "7-day free trial",
    ],
    isActive: true,
    displayOrder: 2,
  },
  {
    name:         "Premium",
    description:  "Unlimited listings, lowest commission, full feature set",
    color:        "#16a34a",
    icon:         "👑",
    monthlyFee:   1500,
    billingCycle: "monthly",
    trialDays:    14,
    productLimit: 200,
    minProductPrice: 0,
    maxProductPrice: 0,
    commissionRate: 2,
    features: [
      "List up to 200 products per month",
      "2% commission on each sale",
      "Full analytics + revenue reports",
      "Priority support + scheduled meetings",
      "14-day free trial",
      "Featured seller badge",
    ],
    isActive: true,
    displayOrder: 3,
  },
];

async function seed() {
  try {
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected:", mongoose.connection.host);

    console.log("\n📋 Seeding seller plans...");
    for (const plan of PLANS) {
      const exists = await SellerPlan.findOne({ name: plan.name });
      if (exists) {
        console.log(`  ⏭  Already exists: ${plan.name}`);
        continue;
      }
      await SellerPlan.create(plan);
      console.log(`  ✅ Created: ${plan.icon} ${plan.name} — ${plan.monthlyFee === 0 ? "Free" : `${plan.monthlyFee} ETB/month`}`);
    }

    console.log("\n🎉 Seller plans seeded!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seed();
