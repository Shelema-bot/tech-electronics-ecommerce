import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./AddCategory.css";

function AddCategory() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName]     = useState("");
  const [image, setImage]   = useState(null);
  const [loading, setLoading] = useState(false);

  const submitCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning("Category name is required"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", name);
      if (image) fd.append("image", image);
      await API.post("/categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category added successfully");
      navigate("/admin/categories");
    } catch (err) {
      console.log("ADD CATEGORY ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-category">
        <h1>Add Category</h1>
        <form onSubmit={submitCategory}>
          <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddCategory;
