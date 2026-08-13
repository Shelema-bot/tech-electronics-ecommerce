/**
 * seed.js — Seeds products & categories into MongoDB Atlas
 * and uploads images to Cloudinary from the postman/environments/cloudFiles folder.
 *
 * Usage:  node seed.js
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Product from "./models/Product.js";
import Category from "./models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Cloudinary config ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Image folder ────────────────────────────────────────────────────
const IMAGE_DIR = path.join(
  __dirname,
  "..",
  "postman",
  "environments",
  "cloudFiles"
);

// ─── Helper: upload a local image to Cloudinary ───────────────────────
async function uploadImage(filePath, folder = "tech-ecommerce/products") {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    console.log(`  ✅ Uploaded: ${path.basename(filePath)} → ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.log(`  ❌ Failed: ${path.basename(filePath)} — ${err.message}`);
    return null;
  }
}

// ─── Helper: find image file in the image dir ────────────────────────
function findImage(name) {
  const files = fs.readdirSync(IMAGE_DIR);
  const match = files.find(
    (f) => f.toLowerCase().includes(name.toLowerCase()) && !fs.statSync(path.join(IMAGE_DIR, f)).isDirectory()
  );
  return match ? path.join(IMAGE_DIR, match) : null;
}

// ─── Categories ───────────────────────────────────────────────────────
const categoryData = [
  { name: "Laptops" },
  { name: "Smartphones" },
  { name: "Gaming" },
  { name: "Network" },
  { name: "Smart Accessories" },
  { name: "Smart Watch" },
];

// ─── Products ─────────────────────────────────────────────────────────
const productData = [
  {
    name: "Dell Laptop 11",
    brand: "Dell",
    category: "Laptops",
    description: "Powerful Dell laptop with Intel Core i5, 8GB RAM, 256GB SSD. Perfect for work and study.",
    price: 45000,
    stock: 15,
    imageSearch: "Dell Laptop 11",
  },
  {
    name: "HP Pavilion Laptop",
    brand: "HP",
    category: "Laptops",
    description: "HP Pavilion with Ryzen 5, 8GB RAM, 512GB SSD. Sleek design with high performance.",
    price: 52000,
    stock: 10,
    imageSearch: "HP pavilino",
  },
  {
    name: "HP Laptop",
    brand: "HP",
    category: "Laptops",
    description: "HP laptop ideal for everyday tasks, business and multimedia entertainment.",
    price: 38000,
    stock: 20,
    imageSearch: "HP.jpg",
  },
  {
    name: "Samsung Galaxy Smartphone",
    brand: "Samsung",
    category: "Smartphones",
    description: "Samsung Galaxy with 6.5\" display, 128GB storage, triple camera, 5000mAh battery.",
    price: 28000,
    stock: 30,
    imageSearch: "samsung.jpg",
  },
  {
    name: "Gaming Setup",
    brand: "Various",
    category: "Gaming",
    description: "Complete gaming setup with high-refresh display, mechanical keyboard and RGB accessories.",
    price: 75000,
    stock: 5,
    imageSearch: "gaming.jpg",
  },
  {
    name: "D-Link DIR-825 Router",
    brand: "D-Link",
    category: "Network",
    description: "Dual-band AC1200 Wi-Fi router with 4 LAN ports, USB port, and advanced security.",
    price: 3500,
    stock: 25,
    imageSearch: "D-Link DIR-825",
  },
  {
    name: "Netgear Nighthawk Router",
    brand: "Netgear",
    category: "Network",
    description: "Netgear Nighthawk AC2300 Smart WiFi router — ultra-fast speeds for gaming and streaming.",
    price: 7500,
    stock: 12,
    imageSearch: "Netgear Nighthawk",
  },
  {
    name: "TP-Link Archer AX55 Router",
    brand: "TP-Link",
    category: "Network",
    description: "AX3000 Wi-Fi 6 router with OFDMA and MU-MIMO for blazing fast connections.",
    price: 5800,
    stock: 18,
    imageSearch: "TP-Link Archer",
  },
  {
    name: "Anker Fast Charger",
    brand: "Anker",
    category: "Smart Accessories",
    description: "65W Anker USB-C fast charger — charges laptops, phones and tablets simultaneously.",
    price: 1800,
    stock: 50,
    imageSearch: "Anker Fast Charger",
  },
  {
    name: "Baseus Bluetooth Earbuds",
    brand: "Baseus",
    category: "Smart Accessories",
    description: "True wireless earbuds with active noise cancellation, 30hr battery life.",
    price: 2200,
    stock: 40,
    imageSearch: "Baseus Bluetooth",
  },
  {
    name: "Samsung Wireless Charger",
    brand: "Samsung",
    category: "Smart Accessories",
    description: "15W Samsung fast wireless charger compatible with all Qi devices.",
    price: 1200,
    stock: 35,
    imageSearch: "Samsung Wireless Charger",
  },
  {
    name: "Apple Watch Series 10",
    brand: "Apple",
    category: "Smart Watch",
    description: "Apple Watch Series 10 with health monitoring, GPS, Always-On Retina display.",
    price: 65000,
    stock: 8,
    imageSearch: "Apple Watch Series 10",
  },
  {
    name: "Samsung Galaxy Watch 7",
    brand: "Samsung",
    category: "Smart Watch",
    description: "Samsung Galaxy Watch 7 with advanced health sensors, BioActive, and 40hr battery.",
    price: 35000,
    stock: 12,
    imageSearch: "Samsung Galaxy Watch 7",
  },
  {
    name: "Huawei Watch GT 5",
    brand: "Huawei",
    category: "Smart Watch",
    description: "Huawei Watch GT5 with 2-week battery life, GPS, SpO2, and fitness tracking.",
    price: 22000,
    stock: 15,
    imageSearch: "Huawei Watch GT 5",
  },
];

// ─── Main seed function ───────────────────────────────────────────────
async function seed() {
  try {
    console.log("\n🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected:", mongoose.connection.host);

    // ── Seed categories ──────────────────────────────────────────────
    console.log("\n📂 Seeding categories...");
    const categoryMap = {};

    for (const cat of categoryData) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        console.log(`  ⏭  Category exists: ${cat.name}`);
        categoryMap[cat.name] = existing;
      } else {
        const created = await Category.create(cat);
        console.log(`  ✅ Created category: ${cat.name}`);
        categoryMap[cat.name] = created;
      }
    }

    // ── Seed products ────────────────────────────────────────────────
    console.log("\n📦 Seeding products...");

    for (const p of productData) {
      const existing = await Product.findOne({ name: p.name });
      if (existing) {
        console.log(`  ⏭  Product exists: ${p.name}`);
        continue;
      }

      // Upload image to Cloudinary
      let imageUrl = null;
      const imgPath = findImage(p.imageSearch);
      if (imgPath) {
        console.log(`  📸 Uploading image for: ${p.name}`);
        imageUrl = await uploadImage(imgPath);
      } else {
        console.log(`  ⚠️  No image found for: ${p.name} (search: ${p.imageSearch})`);
      }

      const { imageSearch, ...productFields } = p;
      await Product.create({
        ...productFields,
        images: imageUrl ? [imageUrl] : [],
      });

      console.log(`  ✅ Created product: ${p.name}`);
    }

    console.log("\n🎉 Seeding complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed error:", error.message);
    process.exit(1);
  }
}

seed();
