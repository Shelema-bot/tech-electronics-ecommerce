import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

// Ensure local uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (_e) {}
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  },
});

let storage = diskStorage;
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  try {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "tech-ecommerce/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    });
  } catch (err) {
    console.warn("Cloudinary init warning, using disk storage:", err.message);
    storage = diskStorage;
  }
}

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
});

// Safe proof upload middleware supporting paymentProof, receiptImage, screenshot
export const uploadProof = (req, res, next) => {
  upload.fields([
    { name: "paymentProof", maxCount: 1 },
    { name: "receiptImage", maxCount: 1 },
    { name: "screenshot",   maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.warn("Proof upload middleware notice:", err.message);
    }
    if (req.files) {
      req.file = req.files.paymentProof?.[0] || req.files.receiptImage?.[0] || req.files.screenshot?.[0] || null;
    }
    next();
  });
};

export default upload;