import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { getImageUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import "./AddCategory.css";

function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName]       = useState("");
  const [oldImage, setOldImage] = useState("");
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategory = async () => {
      try {
        const res = await API.get(`/categories/${id}`);
        const cat = res.data.category || res.data;
        setName(cat.name);
        setOldImage(cat.image || "");
      } catch (err) {
        console.log("GET CATEGORY ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    getCategory();
  }, [id]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.warning("Category name is required"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", name);
      if (image) fd.append("image", image);
      await API.put(`/categories/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category updated successfully");
      navigate("/admin/categories");
    } catch (err) {
      console.log("UPDATE CATEGORY ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><h2 style={{padding:"28px"}}>Loading category...</h2></AdminLayout>;

  return (
    <AdminLayout>
      <div className="add-category">
        <h1>Edit Category</h1>
        <form onSubmit={updateCategory}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" required />
          {(preview || oldImage) && (
            <img src={preview || getImageUrl(oldImage)} alt={name} className="category-preview" />
          )}
          <input type="file" accept="image/*" onChange={handleImage} />
          <button disabled={loading}>{loading ? "Updating..." : "Update Category"}</button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditCategory;
