import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./Category.css";

import laptopImg     from "../../assets/category/laptops.png";
import accessoryImg  from "../../assets/category/smart-accessor.jpg";
import watchImg      from "../../assets/category/smart-watch.jpg";
import smartphoneImg from "../../assets/category/smart-phone.jpg";
import gamingImg     from "../../assets/category/gaming.jpg";
import networkImg    from "../../assets/category/network.jpg";

const LOCAL_IMAGES = {
  Laptops:            laptopImg,
  Smartphones:        smartphoneImg,
  Gaming:             gamingImg,
  Network:            networkImg,
  "Smart Accessories":accessoryImg,
  "Smart Watch":      watchImg,
};

const FALLBACK_ICONS = {
  "Headphones & Audio": "🎧",
  Tablets:              "📟",
  Drones:               "🚁",
  "Printers & Scanners":"🖨️",
  "Smart Home":         "🏠",
  Cameras:              "📷",
};

// Resolve image: DB cloud image → local asset → icon fallback
function getCatImage(cat) {
  if (cat.image) return { type: "url", src: getImageUrl(cat.image) };
  if (LOCAL_IMAGES[cat.name]) return { type: "url", src: LOCAL_IMAGES[cat.name] };
  return { type: "icon", src: FALLBACK_ICONS[cat.name] || "📦" };
}

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const getCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/categories");
      const data = res.data;
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {
      console.log("CATEGORY ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getCategories(); }, []);

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success("Category deleted successfully");
      getCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-page"><h2>Loading categories...</h2></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="category-header">
        <div className="category-heading">
          <h1>Manage Categories</h1>
          <p>Add, edit and delete categories</p>
        </div>
        <button className="add-category-btn" onClick={() => navigate("/admin/add-category")}>
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-category">
          <h2>No Categories Found</h2>
          <button className="add-category-btn" onClick={() => navigate("/admin/add-category")}>
            + Add Category
          </button>
        </div>
      ) : (
        <div className="category-list">
          {categories.map((cat) => {
            const img = getCatImage(cat);
            return (
            <div className="category-card" key={cat._id}>
              <div className="category-image-container">
                {img.type === "url" ? (
                  <img src={img.src} alt={cat.name} className="category-image" />
                ) : (
                  <div className="cat-icon-thumb">{img.src}</div>
                )}
              </div>
              <div className="category-content">
                <h3>{cat.name}</h3>
                <div className="category-actions">
                  <button className="edit-category" onClick={() => navigate(`/admin/edit-category/${cat._id}`)}>Edit</button>
                  <button className="delete-category" onClick={() => deleteCategory(cat._id)}>Delete</button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

export default Category;
