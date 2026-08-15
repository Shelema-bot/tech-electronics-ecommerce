/**
 * seed.js — Unified seed for ALL categories and products
 * Run: node seed.js
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_DIR = path.join(__dirname, "..", "postman", "environments", "cloudFiles");

async function uploadImage(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: "tech-ecommerce/products" });
    console.log(`  📸 Uploaded: ${path.basename(filePath)}`);
    return result.secure_url;
  } catch (err) {
    console.log(`  ❌ Upload failed: ${err.message}`);
    return null;
  }
}

function findLocalImage(name) {
  if (!fs.existsSync(IMAGE_DIR)) return null;
  const files = fs.readdirSync(IMAGE_DIR);
  const match = files.find(
    (f) => f.toLowerCase().includes(name.toLowerCase()) &&
           !fs.statSync(path.join(IMAGE_DIR, f)).isDirectory()
  );
  return match ? path.join(IMAGE_DIR, match) : null;
}

// ═══════════════════════════════════════════════════════════
// ALL CATEGORIES (12 total)
// ═══════════════════════════════════════════════════════════
const ALL_CATEGORIES = [
  "Laptops",
  "Smartphones",
  "Gaming",
  "Network",
  "Smart Accessories",
  "Smart Watch",
  "Headphones & Audio",
  "Tablets",
  "Drones",
  "Printers & Scanners",
  "Smart Home",
  "Cameras",
];

// ═══════════════════════════════════════════════════════════
// ALL PRODUCTS
// local: true  → upload from postman/cloudFiles folder
// local: false → use imageUrl (Unsplash CDN)
// ═══════════════════════════════════════════════════════════
const ALL_PRODUCTS = [

  // ── LAPTOPS ──────────────────────────────────────────────
  {
    name: "Dell Laptop 11",
    brand: "Dell", category: "Laptops",
    description: "Powerful Dell laptop with Intel Core i5, 8GB RAM, 256GB SSD. Perfect for work and study.",
    price: 45000, stock: 15,
    local: true, imageSearch: "Dell Laptop 11",
  },
  {
    name: "HP Pavilion Laptop",
    brand: "HP", category: "Laptops",
    description: "HP Pavilion with Ryzen 5, 8GB RAM, 512GB SSD. Sleek design with high performance.",
    price: 52000, stock: 10,
    local: true, imageSearch: "HP pavilino",
  },
  {
    name: "HP Laptop",
    brand: "HP", category: "Laptops",
    description: "HP laptop ideal for everyday tasks, business and multimedia entertainment.",
    price: 38000, stock: 20,
    local: true, imageSearch: "HP.jpg",
  },

  // ── SMARTPHONES ──────────────────────────────────────────
  {
    name: "Samsung Galaxy Smartphone",
    brand: "Samsung", category: "Smartphones",
    description: "Samsung Galaxy with 6.5\" display, 128GB storage, triple camera, 5000mAh battery.",
    price: 28000, stock: 30,
    local: true, imageSearch: "samsung.jpg",
  },

  // ── GAMING ───────────────────────────────────────────────
  {
    name: "Gaming Setup",
    brand: "Various", category: "Gaming",
    description: "Complete gaming setup with high-refresh display, mechanical keyboard and RGB accessories.",
    price: 75000, stock: 5,
    local: true, imageSearch: "gaming.jpg",
  },

  // ── NETWORK ──────────────────────────────────────────────
  {
    name: "D-Link DIR-825 Router",
    brand: "D-Link", category: "Network",
    description: "Dual-band AC1200 Wi-Fi router with 4 LAN ports, USB port, and advanced security.",
    price: 3500, stock: 25,
    local: true, imageSearch: "D-Link DIR-825",
  },
  {
    name: "Netgear Nighthawk Router",
    brand: "Netgear", category: "Network",
    description: "Netgear Nighthawk AC2300 Smart WiFi router — ultra-fast speeds for gaming and streaming.",
    price: 7500, stock: 12,
    local: true, imageSearch: "Netgear Nighthawk",
  },
  {
    name: "TP-Link Archer AX55 Router",
    brand: "TP-Link", category: "Network",
    description: "AX3000 Wi-Fi 6 router with OFDMA and MU-MIMO for blazing fast connections.",
    price: 5800, stock: 18,
    local: true, imageSearch: "TP-Link Archer",
  },

  // ── SMART ACCESSORIES ────────────────────────────────────
  {
    name: "Anker Fast Charger",
    brand: "Anker", category: "Smart Accessories",
    description: "65W Anker USB-C fast charger — charges laptops, phones and tablets simultaneously.",
    price: 1800, stock: 50,
    local: true, imageSearch: "Anker Fast Charger",
  },
  {
    name: "Baseus Bluetooth Earbuds",
    brand: "Baseus", category: "Smart Accessories",
    description: "True wireless earbuds with active noise cancellation, 30hr battery life.",
    price: 2200, stock: 40,
    local: true, imageSearch: "Baseus Bluetooth",
  },
  {
    name: "Samsung Wireless Charger",
    brand: "Samsung", category: "Smart Accessories",
    description: "15W Samsung fast wireless charger compatible with all Qi devices.",
    price: 1200, stock: 35,
    local: true, imageSearch: "Samsung Wireless Charger",
  },

  // ── SMART WATCH ───────────────────────────────────────────
  {
    name: "Apple Watch Series 10",
    brand: "Apple", category: "Smart Watch",
    description: "Apple Watch Series 10 with health monitoring, GPS, Always-On Retina display.",
    price: 65000, stock: 8,
    local: true, imageSearch: "Apple Watch Series 10",
  },
  {
    name: "Samsung Galaxy Watch 7",
    brand: "Samsung", category: "Smart Watch",
    description: "Samsung Galaxy Watch 7 with BioActive sensor, advanced health tracking, 40hr battery.",
    price: 35000, stock: 12,
    local: true, imageSearch: "Samsung Galaxy Watch 7",
  },
  {
    name: "Huawei Watch GT 5",
    brand: "Huawei", category: "Smart Watch",
    description: "Huawei Watch GT5 with 2-week battery life, GPS, SpO2, and fitness tracking.",
    price: 22000, stock: 15,
    local: true, imageSearch: "Huawei Watch GT 5",
  },

  // ── HEADPHONES & AUDIO ────────────────────────────────────
  {
    name: "Sony WH-1000XM5",
    brand: "Sony", category: "Headphones & Audio",
    description: "Industry-leading noise cancellation with 8 microphones and 2 processors. 30-hour battery, Hi-Res audio, LDAC. Quick charge — 3 min = 3 hours.",
    price: 55000, stock: 20,
    local: false, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  {
    name: "Bose QuietComfort 45",
    brand: "Bose", category: "Headphones & Audio",
    description: "World-class noise cancellation, 24-hour battery, Aware Mode for transparency. Premium over-ear comfort.",
    price: 48000, stock: 15,
    local: false, imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
  },
  {
    name: "JBL Flip 6 Speaker",
    brand: "JBL", category: "Headphones & Audio",
    description: "Portable Bluetooth speaker with IP67 waterproof, 12-hour playtime, bold JBL Original Pro Sound.",
    price: 12000, stock: 35,
    local: false, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
  },

  // ── TABLETS ───────────────────────────────────────────────
  {
    name: "Apple iPad Pro 11 M4",
    brand: "Apple", category: "Tablets",
    description: "M4 chip, Ultra Retina XDR OLED display, 256GB, Apple Pencil Pro support. Wi-Fi 6E, Bluetooth 5.3.",
    price: 155000, stock: 8,
    local: false, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
  },
  {
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung", category: "Tablets",
    description: "11\" Dynamic AMOLED 2X, Snapdragon 8 Gen 2, IP68, S Pen included, 45W fast charging.",
    price: 98000, stock: 12,
    local: false, imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80",
  },
  {
    name: "Lenovo Tab P12 Pro",
    brand: "Lenovo", category: "Tablets",
    description: "12.6\" AMOLED 2560x1600, Snapdragon 870, 8GB RAM, 256GB, quad JBL speakers, 10200mAh.",
    price: 72000, stock: 10,
    local: false, imageUrl: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80",
  },

  // ── DRONES ────────────────────────────────────────────────
  {
    name: "DJI Mini 4 Pro",
    brand: "DJI", category: "Drones",
    description: "Under 249g, 4K/60fps HDR, 1/1.3\" sensor, omnidirectional obstacle sensing, 34-min flight time.",
    price: 95000, stock: 6,
    local: false, imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80",
  },
  {
    name: "DJI Air 3",
    brand: "DJI", category: "Drones",
    description: "Dual camera system, 4K/60fps HDR, 46-min flight, APAS 5.0 omnidirectional obstacle avoidance.",
    price: 145000, stock: 4,
    local: false, imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80",
  },
  {
    name: "Holy Stone HS720E",
    brand: "Holy Stone", category: "Drones",
    description: "4K EIS camera, 2-axis gimbal, GPS auto return, follow me mode, 23-min flight time. Beginner friendly.",
    price: 22000, stock: 18,
    local: false, imageUrl: "https://images.unsplash.com/photo-1506947411487-a56738267384?w=600&q=80",
  },

  // ── PRINTERS & SCANNERS ───────────────────────────────────
  {
    name: "HP LaserJet Pro M404n",
    brand: "HP", category: "Printers & Scanners",
    description: "40 ppm monochrome laser, 1200 dpi, duplex printing, 250-sheet tray, USB + Ethernet.",
    price: 18500, stock: 12,
    local: false, imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80",
  },
  {
    name: "Epson EcoTank L3250",
    brand: "Epson", category: "Printers & Scanners",
    description: "All-in-one ink tank printer, Wi-Fi, print/scan/copy, 5760×1440 dpi, ultra-low cost per page.",
    price: 14000, stock: 20,
    local: false, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    name: "Canon PIXMA G3420",
    brand: "Canon", category: "Printers & Scanners",
    description: "Wireless MegaTank all-in-one, refillable ink tanks, 6000 black / 7700 colour pages, Canon PRINT app.",
    price: 13500, stock: 16,
    local: false, imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80",
  },

  // ── SMART HOME ────────────────────────────────────────────
  {
    name: "Amazon Echo Dot 5th Gen",
    brand: "Amazon", category: "Smart Home",
    description: "Smart speaker with Alexa, temperature sensor, motion detection, improved audio. Control smart home devices.",
    price: 5500, stock: 40,
    local: false, imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80",
  },
  {
    name: "Philips Hue Starter Kit",
    brand: "Philips", category: "Smart Home",
    description: "3 A19 smart bulbs + Hue Bridge, 16 million colours, works with Alexa, Google Home, Apple HomeKit.",
    price: 18000, stock: 25,
    local: false, imageUrl: "https://images.unsplash.com/photo-1557318041-1ce374d55ebf?w=600&q=80",
  },
  {
    name: "TP-Link Tapo C200 Camera",
    brand: "TP-Link", category: "Smart Home",
    description: "360° pan/tilt 1080p security camera, night vision 30ft, 2-way audio, motion alerts, Alexa/Google.",
    price: 3800, stock: 30,
    local: false, imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80",
  },

  // ── CAMERAS ───────────────────────────────────────────────
  {
    name: "Sony Alpha A7 IV",
    brand: "Sony", category: "Cameras",
    description: "33MP full-frame mirrorless, 4K 60p, 10fps burst, 759-point AF, dual card slots, weather sealing.",
    price: 320000, stock: 5,
    local: false, imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  },
  {
    name: "Canon EOS R50",
    brand: "Canon", category: "Cameras",
    description: "24.2MP APS-C mirrorless, 4K video, Dual Pixel AF II, 375g, vertical 4K for creators.",
    price: 95000, stock: 10,
    local: false, imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
  },
  {
    name: "GoPro HERO12 Black",
    brand: "GoPro", category: "Cameras",
    description: "5.3K60 video, 27MP photos, HyperSmooth 6.0, waterproof to 33ft, Horizon Lock, live streaming.",
    price: 55000, stock: 14,
    local: false, imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("\n🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected:", mongoose.connection.host);

    // Categories
    console.log("\n📂 Seeding categories...");
    for (const name of ALL_CATEGORIES) {
      const exists = await Category.findOne({ name });
      if (exists) { console.log(`  ⏭  Exists: ${name}`); continue; }
      await Category.create({ name });
      console.log(`  ✅ Created: ${name}`);
    }

    // Products
    console.log("\n📦 Seeding products...");
    for (const p of ALL_PRODUCTS) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) { console.log(`  ⏭  Exists: ${p.name}`); continue; }

      let imageUrl = p.imageUrl || null;

      if (p.local) {
        const imgPath = findLocalImage(p.imageSearch);
        if (imgPath) {
          imageUrl = await uploadImage(imgPath);
        } else {
          console.log(`  ⚠️  No local image for: ${p.name}`);
        }
      }

      const { local, imageSearch, imageUrl: _iu, ...fields } = p;
      await Product.create({ ...fields, images: imageUrl ? [imageUrl] : [] });
      console.log(`  ✅ Created: ${p.name} [${p.category}]`);
    }

    console.log("\n🎉 All done! Database is fully seeded.\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
