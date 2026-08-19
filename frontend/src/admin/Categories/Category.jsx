import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Category.css";

import laptopImg    from "../../assets/category/laptops.png";
import accessoryImg from "../../assets/category/smart-accessor.jpg";
import watchImg     from "../../assets/category/smart-watch.jpg";
import smartphoneImg from "../../assets/category/smart-phone.jpg";
import gamingImg    from "../../assets/category/gaming.jpg";
import networkImg   from "../../assets/category/network.jpg";

const categoryImages = {
  Laptops: laptopImg,
  Smartphones: smartphoneImg,
  Gaming: gamingImg,
  Network: networkImg,
  "Smart Accessories": accessoryImg,
  "Smart Watch": watchImg,
};

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
          {categories.map((cat) => (
            <div className="category-card" key={cat._id}>
              <div className="category-image-container">
                {categoryImages[cat.name] ? (
                  <img src={categoryImages[cat.name]} alt={cat.name} className="category-image" />
                ) : (
                  <div className="no-image">No Image</div>
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
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default Category;
