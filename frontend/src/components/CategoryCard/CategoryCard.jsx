import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Professional High-Resolution Studio Tech Photography
import laptopImg     from "../../assets/category/laptops.jpg";
import smartphoneImg from "../../assets/category/smartphones.jpg";
import gamingImg     from "../../assets/category/gaming.jpg";
import networkImg    from "../../assets/category/network.jpg";
import accessoryImg  from "../../assets/category/smart-accessories.jpg";
import watchImg      from "../../assets/category/smart-watch.jpg";
import headphoneImg  from "../../assets/category/headphones.jpg";
import tabletImg     from "../../assets/category/tablets.jpg";
import droneImg      from "../../assets/category/drones.jpg";
import printerImg    from "../../assets/category/printers.jpg";
import smarthomeImg  from "../../assets/category/smart-home.jpg";
import cameraImg     from "../../assets/category/cameras.jpg";

export const CAT_IMAGE_MAP = {
  Laptops:              laptopImg,
  Smartphones:          smartphoneImg,
  Gaming:               gamingImg,
  Network:              networkImg,
  "Smart Accessories":  accessoryImg,
  "Smart Watch":        watchImg,
  "Headphones & Audio": headphoneImg,
  Tablets:              tabletImg,
  Drones:               droneImg,
  "Printers & Scanners":printerImg,
  "Smart Home":         smarthomeImg,
  Cameras:              cameraImg,
};

const categories = [
  { name: "Laptops",            category: "Laptops" },
  { name: "Smartphones",        category: "Smartphones" },
  { name: "Gaming",             category: "Gaming" },
  { name: "Headphones & Audio", category: "Headphones & Audio" },
  { name: "Smart Watch",        category: "Smart Watch" },
  { name: "Tablets",            category: "Tablets" },
  { name: "Smart Accessories",  category: "Smart Accessories" },
  { name: "Cameras",            category: "Cameras" },
  { name: "Network",            category: "Network" },
  { name: "Drones",             category: "Drones" },
  { name: "Smart Home",         category: "Smart Home" },
  { name: "Printers & Scanners",category: "Printers & Scanners" },
];

function CategoryCard() {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  return (
    <section className="category-section">
      <div className="category-section-header">
        <span className="category-badge">⚡ {t("nav.categories", "Categories")}</span>
        <h2 className="category-title">{t("product.shopByCategory", "Shop By Category")}</h2>
        <p className="category-subtitle">
          {t("product.browseCategories", "Browse {{count}} categories of latest tech", { count: categories.length })}
        </p>
      </div>

      <div className="category-container">
        {categories.map((cat, index) => {
          const catImg = CAT_IMAGE_MAP[cat.name] || laptopImg;
          return (
            <div
              className="category-card"
              key={index}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.category)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && navigate(`/products?category=${encodeURIComponent(cat.category)}`)}
            >
              <div className="category-image-wrap">
                <img
                  src={catImg}
                  alt={cat.name}
                  loading="lazy"
                  className="category-img"
                  onError={(e) => { e.currentTarget.src = laptopImg; }}
                />
                <div className="category-img-shine" />
              </div>
              <h3 className="category-name">{t("cat." + cat.name, cat.name)}</h3>
              <span className="category-explore-link">{t("hero.shopNow", "Shop Now")} ›</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryCard;
