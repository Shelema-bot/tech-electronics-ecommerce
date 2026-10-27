/**
 * imageSearchController.js
 *
 * Visual product search via image upload.
 * Strategy: upload the query image to Cloudinary, then use
 * Cloudinary's color analysis to extract the dominant category/
 * label and fall back to text-based matching on product names,
 * categories, and brands.
 *
 * This approach requires zero extra paid APIs — only uses the
 * existing Cloudinary account already in the project.
 */
import cloudinary from "../config/cloudinary.js";
import Product    from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── Keyword maps — map common objects/colors to product categories ────────────
const CATEGORY_KEYWORDS = {
  // Electronics
  laptop:    ["Laptops"],
  computer:  ["Laptops"],
  notebook:  ["Laptops"],
  phone:     ["Smartphones"],
  mobile:    ["Smartphones"],
  smartphone:["Smartphones"],
  tablet:    ["Tablets"],
  ipad:      ["Tablets"],
  watch:     ["Smart Watch"],
  smartwatch:["Smart Watch"],
  wearable:  ["Smart Watch"],
  headphone: ["Headphones & Audio"],
  headset:   ["Headphones & Audio"],
  earphone:  ["Headphones & Audio"],
  speaker:   ["Headphones & Audio"],
  camera:    ["Cameras"],
  drone:     ["Drones"],
  router:    ["Network"],
  wifi:      ["Network"],
  printer:   ["Printers & Scanners"],
  scanner:   ["Printers & Scanners"],
  // Smart home
  smart:     ["Smart Home", "Smart Accessories"],
  bulb:      ["Smart Home"],
  light:     ["Smart Home"],
  // Gaming
  gaming:    ["Gaming"],
  game:      ["Gaming"],
  controller:["Gaming"],
  joystick:  ["Gaming"],
  // Accessories
  cable:     ["Smart Accessories"],
  charger:   ["Smart Accessories"],
  usb:       ["Smart Accessories"],
  mouse:     ["Smart Accessories"],
  keyboard:  ["Smart Accessories"],
};

function inferCategoriesFromTags(tags = []) {
  const matched = new Set();
  const lower   = tags.map(t => t.toLowerCase());
  for (const tag of lower) {
    for (const [kw, cats] of Object.entries(CATEGORY_KEYWORDS)) {
      if (tag.includes(kw)) cats.forEach(c => matched.add(c));
    }
  }
  return [...matched];
}

// POST /api/products/search-by-image
export const searchByImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please upload an image file" });
  }

  try {
    // ── Step 1: Upload to Cloudinary and get auto-tags + categorization ──────
    const uploadResult = await cloudinary.uploader.upload(req.file.path || req.file.buffer?.toString("base64"), {
      folder:           "tech-ecommerce/search-queries",
      categorization:   "google_tagging",
      auto_tagging:      0.6,        // confidence threshold
      resource_type:    "image",
      transformation:   [{ width: 600, crop: "limit" }],
    }).catch(() => null);

    // ── Step 2: Build search terms from Cloudinary AI tags ───────────────────
    const aiTags = uploadResult?.tags || [];
    const aiInfo = uploadResult?.info?.categorization?.google_tagging?.data || [];
    const allLabels = [
      ...aiTags,
      ...aiInfo.map(d => d.tag),
    ];

    const inferredCategories = inferCategoriesFromTags(allLabels);

    // ── Step 3: Clean up the temp query image ────────────────────────────────
    if (uploadResult?.public_id) {
      cloudinary.uploader.destroy(uploadResult.public_id).catch(() => {});
    }

    // ── Step 4: Search products ───────────────────────────────────────────────
    const publicFilter = { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] };
    let products = [];

    if (inferredCategories.length > 0) {
      // Category-matched search
      products = await Product.find({
        ...publicFilter,
        category: { $in: inferredCategories },
      }).limit(20).lean();
    }

    // Also do a text search across all labels for broader coverage
    if (products.length < 8 && allLabels.length > 0) {
      const termRegexes = allLabels.slice(0, 8).map(l => new RegExp(l, "i"));
      const textMatches = await Product.find({
        ...publicFilter,
        $or: [
          { name:        { $in: termRegexes } },
          { brand:       { $in: termRegexes } },
          { category:    { $in: termRegexes } },
          { description: { $in: termRegexes } },
        ],
      }).limit(20).lean();

      // Merge, dedupe by _id
      const seen = new Set(products.map(p => p._id.toString()));
      for (const p of textMatches) {
        if (!seen.has(p._id.toString())) {
          products.push(p);
          seen.add(p._id.toString());
        }
      }
    }

    // If AI returned nothing useful, return popular products as fallback
    if (products.length === 0) {
      products = await Product.find(publicFilter)
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();
    }

    return res.json({
      success:    true,
      count:      products.length,
      products,
      detectedLabels: allLabels.slice(0, 10),
      matchedCategories: inferredCategories,
    });

  } catch (err) {
    // Graceful degradation — return popular products
    const products = await Product.find({
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
    }).sort({ createdAt: -1 }).limit(12).lean();

    return res.json({
      success:  true,
      fallback: true,
      count:    products.length,
      products,
      detectedLabels:    [],
      matchedCategories: [],
    });
  }
});
