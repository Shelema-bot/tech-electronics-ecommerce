// Utility to resolve image URLs from MongoDB/Cloudinary or backend
const BACKEND = "https://tech-electronics-backend.onrender.com";

export function getImageUrl(path) {
  if (!path) return null;
  // Already a full URL (Cloudinary or http/https)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Local path from backend uploads folder
  return `${BACKEND}/${path.replace(/\\/g, "/")}`;
}
