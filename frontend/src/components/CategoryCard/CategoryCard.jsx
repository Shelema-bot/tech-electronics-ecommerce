import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import laptopImg      from "../../assets/category/laptops.png";
import accessoryImg   from "../../assets/category/smart-accessor.jpg";
import watchImg       from "../../assets/category/smart-watch.jpg";
import smartphoneImg  from "../../assets/category/smart-phone.jpg";
import gamingImg      from "../../assets/category/gaming.jpg";
import networkImg     from "../../assets/category/network.jpg";

const CAT_IMAGE_MAP = {
  Laptops:            laptopImg,
  Smartphones:        smartphoneImg,
  Gaming:             gamingImg,
  Network:            networkImg,
  "Smart Accessories":accessoryImg,
  "Smart Watch":      watchImg,
};

const CAT_ICON_MAP = {
  Laptops:              "💻",
  Smartphones:          "📱",
  Gaming:               "🎮",
  Network:              "🌐",
  "Smart Accessories":  "🔌",
  "Smart Watch":        "⌚",
  "Headphones & Audio": "🎧",
  Tablets:              "📟",
  Drones:               "🚁",
  "Printers & Scanners":"🖨️",
  "Smart Home":         "🏠",
  Cameras:              "📷",
};

const categories = [
  { name: "Laptops",            category: "Laptops" },
  { name: "Smartphones",        category: "Smartphones" },
  { name: "Gaming",             category: "Gaming" },
  { name: "Network",            category: "Network" },
  { name: "Smart Accessories",  category: "Smart Accessories" },
  { name: "Smart Watch",        category: "Smart Watch" },
  { name: "Headphones & Audio", category: "Headphones & Audio" },
  { name: "Tablets",            category: "Tablets" },
  { name: "Drones",             category: "Drones" },
  { name: "Printers & Scanners",category: "Printers & Scanners" },
  { name: "Smart Home",         category: "Smart Home" },
  { name: "Cameras",            category: "Cameras" },
];

function CategoryCard() {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  return (
    <section className="category-section">
      <div className="category-section-header">
        <h2 className="category-title">{t("product.shopByCategory", "Shop By Category")}</h2>
        <p className="category-subtitle">
          {t("product.browseCategories", "Browse {{count}} categories of latest tech", { count: categories.length })}
        </p>
      </div>

      <div className="category-container">
        {categories.map((cat, index) => {
          const localImg = CAT_IMAGE_MAP[cat.name];
          const icon     = CAT_ICON_MAP[cat.name] || "📦";
          return (
            <div
              className="category-card"
              key={index}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.category)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && navigate(`/products?category=${encodeURIComponent(cat.category)}`)}
            >
              <div className="category-image">
                {localImg ? (
                  <img src={localImg} alt={cat.name} loading="lazy" />
                ) : (
                  <div className="cat-icon-fallback">{icon}</div>
                )}
              </div>
              <h3>{cat.name}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryCard;
