/**
 * seedNew.js — Adds 6 NEW categories + 3 products each to MongoDB Atlas
 * Uses real Unsplash image URLs (free to use)
 * Run: node seedNew.js
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

// ─── 6 NEW categories (don't touch existing ones) ─────────────────
const NEW_CATEGORIES = [
  "Headphones & Audio",
  "Tablets",
  "Drones",
  "Printers & Scanners",
  "Smart Home",
  "Cameras",
];

// ─── 3 products per category ──────────────────────────────────────
// Images from Unsplash CDN — reliable, free, high quality
const NEW_PRODUCTS = [

  // ── Headphones & Audio ──────────────────────────────────────────
  {
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Headphones & Audio",
    description: "Industry-leading noise cancellation with 8 microphones and 2 processors. 30-hour battery life, Hi-Res audio, LDAC support. Lightweight design at 250g. USB-C charging with quick charge (3 min = 3 hours).",
    price: 55000,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"],
  },
  {
    name: "Bose QuietComfort 45",
    brand: "Bose",
    category: "Headphones & Audio",
    description: "World-class noise cancellation, 24-hour battery, comfortable acoustic noise cancelling headphones with Aware Mode. Premium over-ear design with Bose Acoustic Noise Cancelling technology.",
    price: 48000,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80"],
  },
  {
    name: "JBL Flip 6 Speaker",
    brand: "JBL",
    category: "Headphones & Audio",
    description: "Portable Bluetooth speaker with bold JBL Original Pro Sound. IP67 waterproof & dustproof. 12-hour playtime, PartyBoost for connecting multiple speakers. USB-C charging.",
    price: 12000,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"],
  },

  // ── Tablets ─────────────────────────────────────────────────────
  {
    name: "Apple iPad Pro 11\" M4",
    brand: "Apple",
    category: "Tablets",
    description: "Powered by Apple M4 chip with 10-core CPU and 10-core GPU. Ultra Retina XDR OLED display, 256GB storage, 8GB RAM. Apple Pencil Pro support, Magic Keyboard compatible. Wi-Fi 6E, Bluetooth 5.3.",
    price: 155000,
    stock: 8,
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80"],
  },
  {
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    category: "Tablets",
    description: "11\" Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, 8GB RAM, 128GB storage. IP68 water resistant, S Pen included, 8400mAh battery, 45W fast charging. DeX mode for desktop experience.",
    price: 98000,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80"],
  },
  {
    name: "Lenovo Tab P12 Pro",
    brand: "Lenovo",
    category: "Tablets",
    description: "12.6\" AMOLED display with 2560x1600 resolution, Snapdragon 870, 8GB RAM, 256GB storage. Quad JBL speakers, 10200mAh battery, stylus support. Ideal for productivity and entertainment.",
    price: 72000,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80"],
  },

  // ── Drones ──────────────────────────────────────────────────────
  {
    name: "DJI Mini 4 Pro",
    brand: "DJI",
    category: "Drones",
    description: "Under 249g with 4K/60fps HDR video, 1/1.3\" CMOS sensor, 48MP photos. Omnidirectional obstacle sensing, 34-minute max flight time, DJI O4 video transmission up to 20km. True Vertical Shooting for social media.",
    price: 95000,
    stock: 6,
    images: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80"],
  },
  {
    name: "DJI Air 3",
    brand: "DJI",
    category: "Drones",
    description: "Dual-camera system with main wide and medium tele cameras. 4K/60fps HDR, 46-min max flight time, APAS 5.0 omnidirectional obstacle avoidance. Ideal for professional aerial photography.",
    price: 145000,
    stock: 4,
    images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80"],
  },
  {
    name: "Holy Stone HS720E",
    brand: "Holy Stone",
    category: "Drones",
    description: "4K EIS camera drone with 2-axis gimbal stabilization. GPS auto return, follow me mode, 23-min flight time. Brushless motors for quieter and longer flights. Beginner friendly.",
    price: 22000,
    stock: 18,
    images: ["https://images.unsplash.com/photo-1506947411487-a56738267384?w=600&q=80"],
  },

  // ── Printers & Scanners ─────────────────────────────────────────
  {
    name: "HP LaserJet Pro M404n",
    brand: "HP",
    category: "Printers & Scanners",
    description: "Monochrome laser printer with 40 ppm speed, 1200 dpi resolution. Automatic two-sided printing, 250-sheet input tray, USB and Ethernet connectivity. Monthly duty cycle up to 80,000 pages.",
    price: 18500,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80"],
  },
  {
    name: "Epson EcoTank L3250",
    brand: "Epson",
    category: "Printers & Scanners",
    description: "All-in-one ink tank printer with Wi-Fi and Wi-Fi Direct. Print, scan, copy. Ultra-low cost per page with high-capacity ink tanks. 5760×1440 dpi print resolution, USB connectivity.",
    price: 14000,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
  },
  {
    name: "Canon PIXMA G3420",
    brand: "Canon",
    category: "Printers & Scanners",
    description: "Wireless all-in-one MegaTank printer. Print, scan, copy with refillable ink tanks for up to 6000 black and 7700 colour pages. Mobile printing via Canon PRINT app. Compact design.",
    price: 13500,
    stock: 16,
    images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80"],
  },

  // ── Smart Home ──────────────────────────────────────────────────
  {
    name: "Amazon Echo Dot 5th Gen",
    brand: "Amazon",
    category: "Smart Home",
    description: "Smart speaker with Alexa. Better audio with bigger vibrant sound, temperature sensor, and improved motion detection. Control smart home devices, play music, make calls, get answers.",
    price: 5500,
    stock: 40,
    images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80"],
  },
  {
    name: "Philips Hue Starter Kit",
    brand: "Philips",
    category: "Smart Home",
    description: "Smart lighting starter kit with 3 A19 LED smart bulbs and Hue Bridge. 16 million colours, works with Alexa, Google Home, Apple HomeKit. Set routines, scenes and automations.",
    price: 18000,
    stock: 25,
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
  },
  {
    name: "TP-Link Tapo C200 Camera",
    brand: "TP-Link",
    category: "Smart Home",
    description: "360° pan/tilt home security Wi-Fi camera. 1080p Full HD, night vision up to 30ft, 2-way audio, motion detection alerts. Works with Alexa and Google Assistant. Free local SD card storage.",
    price: 3800,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80"],
  },

  // ── Cameras ─────────────────────────────────────────────────────
  {
    name: "Sony Alpha A7 IV",
    brand: "Sony",
    category: "Cameras",
    description: "Full-frame mirrorless camera with 33MP BSI-CMOS sensor, 4K 60p video, 10fps burst shooting. Real-time tracking AF with 759 phase-detect points. Dual card slots, weather sealing, 5-axis IBIS.",
    price: 320000,
    stock: 5,
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"],
  },
  {
    name: "Canon EOS R50",
    brand: "Canon",
    category: "Cameras",
    description: "24.2MP APS-C mirrorless camera, 4K video, Dual Pixel CMOS AF II with subject tracking. Compact and lightweight at 375g. Perfect for creators with vertical 4K video support and content creation features.",
    price: 95000,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80"],
  },
  {
    name: "GoPro HERO12 Black",
    brand: "GoPro",
    category: "Cameras",
    description: "5.3K60 + 4K120 video, 27MP photos, HyperSmooth 6.0 stabilization. Waterproof to 33ft without housing, 1/1.9\" sensor with HDR video. Horizon Lock, TimeWarp 3.0, live streaming. Rugged action camera.",
    price: 55000,
    stock: 14,
    images: ["https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80"],
  },
];

// ─── Main ─────────────────────────────────────────────────────────
async function seedNew() {
  try {
    console.log("\n🔌 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected:", mongoose.connection.host);

    // ── Create categories ───────────────────────────────────────
    console.log("\n📂 Creating new categories...");
    for (const name of NEW_CATEGORIES) {
      const exists = await Category.findOne({ name });
      if (exists) {
        console.log(`  ⏭  Already exists: ${name}`);
      } else {
        await Category.create({ name });
        console.log(`  ✅ Created: ${name}`);
      }
    }

    // ── Create products ─────────────────────────────────────────
    console.log("\n📦 Creating new products...");
    for (const p of NEW_PRODUCTS) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) {
        console.log(`  ⏭  Already exists: ${p.name}`);
        continue;
      }
      await Product.create(p);
      console.log(`  ✅ Created: ${p.name} (${p.category})`);
    }

    console.log("\n🎉 Done! 6 categories + 18 products added.\n");
    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedNew();
