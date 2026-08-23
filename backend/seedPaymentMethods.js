/**
 * seedPaymentMethods.js
 * Run once to create default payment methods in MongoDB.
 * Usage: node seedPaymentMethods.js
 *
 * IMPORTANT: Do NOT put real account numbers here.
 * After seeding, super_admin updates the real account details via Admin Dashboard.
 */

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import PaymentMethod from "./models/PaymentMethod.js";

const defaults = [
  {
    name: "Chapa Online Payment",
    code: "chapa",
    type: "chapa",
    description: "Pay securely via Chapa — card, mobile money, or bank transfer",
    enabled: true,
    requiresScreenshot: false,
    requiresReference: false,
    requiresAdminVerification: false,
    displayOrder: 1,
    instructions: "You will be redirected to Chapa's secure payment page.",
  },
  {
    name: "Cash on Delivery",
    code: "cod",
    type: "cash_on_delivery",
    description: "Pay in cash when your order is delivered",
    enabled: true,
    requiresScreenshot: false,
    requiresReference: false,
    requiresAdminVerification: false,
    displayOrder: 2,
    instructions: "Pay the exact amount in cash when your order arrives.",
  },
  {
    name: "Telebirr",
    code: "telebirr",
    type: "manual",
    description: "Pay via Telebirr mobile money",
    enabled: false,  // Admin enables after configuring real account
    requiresScreenshot: true,
    requiresReference: true,
    requiresAdminVerification: true,
    displayOrder: 3,
    accountName:   "Configure via Admin Dashboard",
    phoneNumber:   "Configure via Admin Dashboard",
    instructions:  "1. Open Telebirr app\n2. Send the exact amount to the merchant number\n3. Save your transaction receipt\n4. Enter the transaction reference number below\n5. Upload the payment screenshot\n6. Submit for verification",
  },
  {
    name: "CBE / CBE Birr",
    code: "cbe",
    type: "manual",
    description: "Pay via Commercial Bank of Ethiopia or CBE Birr",
    enabled: false,
    requiresScreenshot: true,
    requiresReference: true,
    requiresAdminVerification: true,
    displayOrder: 4,
    accountName:    "Configure via Admin Dashboard",
    accountNumber:  "Configure via Admin Dashboard",
    bankName:       "Commercial Bank of Ethiopia",
    instructions:   "1. Transfer the exact amount to the CBE account\n2. Save your transaction receipt\n3. Enter the reference number\n4. Upload the receipt screenshot\n5. Submit for verification",
  },
  {
    name: "Bank of Abyssinia",
    code: "boa",
    type: "manual",
    description: "Pay via Bank of Abyssinia",
    enabled: false,
    requiresScreenshot: true,
    requiresReference: true,
    requiresAdminVerification: true,
    displayOrder: 5,
    accountName:    "Configure via Admin Dashboard",
    accountNumber:  "Configure via Admin Dashboard",
    bankName:       "Bank of Abyssinia",
    instructions:   "1. Transfer the exact amount to the BOA account\n2. Save your transaction receipt\n3. Enter the reference number\n4. Upload the receipt\n5. Submit for verification",
  },
];

const seed = async () => {
  await connectDB();
  let created = 0;
  for (const pm of defaults) {
    const exists = await PaymentMethod.findOne({ code: pm.code });
    if (!exists) {
      await PaymentMethod.create(pm);
      console.log(`✅ Created: ${pm.name}`);
      created++;
    } else {
      console.log(`⏭  Already exists: ${pm.name}`);
    }
  }
  console.log(`\nDone. ${created} payment methods created.`);
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
