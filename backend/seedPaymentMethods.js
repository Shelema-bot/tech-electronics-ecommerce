/**
 * seedPaymentMethods.js
 * Seeds default payment methods into the database.
 * Run once: node seedPaymentMethods.js
 * Admin can update account details from the admin panel → Payments → Payment Methods.
 */
import dotenv   from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import PaymentMethod from "./models/PaymentMethod.js";

const METHODS = [
  // ── Chapa (auto online gateway) ───────────────────────────────
  {
    name:        "Chapa Payment",
    code:        "chapa",
    type:        "chapa",
    description: "Pay securely online with Chapa — Visa, MasterCard, Telebirr, Mobile Banking",
    enabled:     true,
    displayOrder: 1,
    requiresScreenshot:        false,
    requiresReference:         false,
    requiresAdminVerification: false,
    instructions: "You will be redirected to the Chapa secure payment page to complete your payment.",
  },

  // ── CBE Birr ─────────────────────────────────────────────────
  {
    name:         "CBE Birr",
    code:         "cbe_birr",
    type:         "manual",
    description:  "Transfer via Commercial Bank of Ethiopia (CBE Birr mobile app)",
    accountName:  "Tech & Electronic Store",
    accountNumber:"1000XXXXXXXXXX",        // ← update via admin panel
    phoneNumber:  "0912345678",            // ← update via admin panel
    bankName:     "Commercial Bank of Ethiopia",
    instructions: "1. Open your CBE Birr app\n2. Go to Send Money → To Account\n3. Enter the account number above\n4. Enter the exact order amount\n5. Take a screenshot and upload it below\n6. Enter the transaction reference number",
    enabled:      true,
    displayOrder: 2,
    requiresScreenshot:        true,
    requiresReference:         true,
    requiresAdminVerification: true,
  },

  // ── Telebirr ─────────────────────────────────────────────────
  {
    name:         "Telebirr",
    code:         "telebirr",
    type:         "manual",
    description:  "Transfer via Ethio Telecom Telebirr wallet",
    accountName:  "Tech & Electronic Store",
    phoneNumber:  "0912345678",            // ← update via admin panel
    instructions: "1. Open your Telebirr app\n2. Select 'Send Money'\n3. Enter our merchant number above\n4. Enter the exact order amount\n5. Confirm the payment\n6. Take a screenshot and upload it below\n7. Enter the transaction reference number",
    enabled:      true,
    displayOrder: 3,
    requiresScreenshot:        true,
    requiresReference:         true,
    requiresAdminVerification: true,
  },

  // ── Bank of Abyssinia ─────────────────────────────────────────
  {
    name:         "Bank of Abyssinia (BOA)",
    code:         "boa",
    type:         "manual",
    description:  "Direct bank transfer to Bank of Abyssinia",
    accountName:  "Tech & Electronic Store",
    accountNumber:"XXXXXXXXXXXXXXXX",      // ← update via admin panel
    bankName:     "Bank of Abyssinia",
    branch:       "Addis Ababa Main Branch",
    instructions: "1. Visit any BOA branch or use BOA internet banking\n2. Transfer to the account number above\n3. Use your Order ID as the transfer reference\n4. Upload your transfer receipt screenshot\n5. Enter the transaction reference number",
    enabled:      true,
    displayOrder: 4,
    requiresScreenshot:        true,
    requiresReference:         true,
    requiresAdminVerification: true,
  },

  // ── Awash Bank ────────────────────────────────────────────────
  {
    name:         "Awash Bank",
    code:         "awash",
    type:         "manual",
    description:  "Direct bank transfer to Awash Bank",
    accountName:  "Tech & Electronic Store",
    accountNumber:"XXXXXXXXXXXXXXXX",      // ← update via admin panel
    bankName:     "Awash Bank",
    branch:       "Addis Ababa Branch",
    instructions: "1. Visit any Awash Bank branch or use internet banking\n2. Transfer to the account number above\n3. Use your Order ID as the transfer reference\n4. Upload your transfer receipt screenshot\n5. Enter the transaction reference number",
    enabled:      true,
    displayOrder: 5,
    requiresScreenshot:        true,
    requiresReference:         true,
    requiresAdminVerification: true,
  },

  // ── Cash on Delivery ─────────────────────────────────────────
  {
    name:         "Cash on Delivery",
    code:         "cod",
    type:         "cash_on_delivery",
    description:  "Pay in cash when your order is delivered to your door",
    instructions: "No upfront payment needed. Our delivery agent will collect the exact amount when your order arrives. Please have the exact amount ready.",
    enabled:      true,
    displayOrder: 6,
    requiresScreenshot:        false,
    requiresReference:         false,
    requiresAdminVerification: false,
  },
];

async function seed() {
  try {
    console.log("\n🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected:", mongoose.connection.host);

    console.log("\n💳 Seeding payment methods...");
    for (const m of METHODS) {
      const exists = await PaymentMethod.findOne({ code: m.code });
      if (exists) {
        console.log(`  ⏭  Already exists: ${m.name}`);
        continue;
      }
      await PaymentMethod.create(m);
      console.log(`  ✅ Created: ${m.name} (${m.type})`);
    }

    console.log("\n🎉 Payment methods seeded successfully!\n");
    console.log("ℹ️  Update placeholder account numbers via:");
    console.log("   Admin Panel → Payments → Payment Methods → Edit\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seed();
