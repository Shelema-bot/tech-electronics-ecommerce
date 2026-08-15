import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";

import laptopImg      from "../../assets/category/laptops.png";
import accessoryImg   from "../../assets/category/smart-accessor.jpg";
import watchImg       from "../../assets/category/smart-watch.jpg";
import smartphoneImg  from "../../assets/category/smart-phone.jpg";
import gamingImg      from "../../assets/category/gaming.jpg";
import networkImg     from "../../assets/category/network.jpg";

const categories = [
  { name: "Laptops",            image: laptopImg,     category: "Laptops" },
  { name: "Smartphones",        image: smartphoneImg, category: "Smartphones" },
  { name: "Gaming",             image: gamingImg,     category: "Gaming" },
  { name: "Network",            image: networkImg,    category: "Network" },
  { name: "Smart Accessories",  image: accessoryImg,  category: "Smart Accessories" },
  { name: "Smart Watch",        image: watchImg,      category: "Smart Watch" },
  // New categories — Unsplash images
  {
    name: "Headphones & Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
    category: "Headphones & Audio",
  },
  {
    name: "Tablets",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80",
    category: "Tablets",
  },
  {
    name: "Drones",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&q=80",
    category: "Drones",
  },
  {
    name: "Printers & Scanners",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&q=80",
    category: "Printers & Scanners",
  },
  {
    name: "Smart Home",
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=300&q=80",
    category: "Smart Home",
  },
  {
    name: "Cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
    category: "Cameras",
  },
];

function CategoryCard() {
  const navigate = useNavigate();

  return (
    <section className="category-section">
      <div className="category-section-header">
        <h2 className="category-title">Shop By Category</h2>
        <p className="category-subtitle">Browse {categories.length} categories of latest tech</p>
      </div>

      <div className="category-container">
        {categories.map((cat, index) => (
          <div
            className="category-card"
            key={index}
            onClick={() => navigate(`/products?category=${encodeURIComponent(cat.category)}`)}
          >
            <div className="category-image">
              <img src={cat.image} alt={cat.name} loading="lazy" />
            </div>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoryCard;
