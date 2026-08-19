import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./AddProduct.css";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [images, setImages]   = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [categories, setCategories] = useState([]);

  const [product, setProduct] = useState({
    name: "", category: "", brand: "", description: "", price: "", stock: "",
  });

  useEffect(() => {
    const getProduct = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get("/categories"),
        ]);
        const data = pRes.data.product || pRes.data;
        setProduct({
          name: data.name || "", category: data.category || "",
          brand: data.brand || "", description: data.description || "",
          price: data.price || "", stock: data.stock || "",
        });
        if (data.images) setPreview(data.images);
        setCategories(cRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const files = [...e.target.files];
    setImages(files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(product).forEach(k => fd.append(k, product[k]));
      images.forEach(img => fd.append("images", img));
      await API.put(`/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div style={{padding:"28px",color:"#64748b"}}>Loading product...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="add-product">
        <h1>Edit Product</h1>
        <form onSubmit={updateProduct}>
          <label>Product Name</label>
          <input name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />

          <label>Category</label>
          <select name="category" value={product.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <label>Brand</label>
          <input name="brand" value={product.brand} onChange={handleChange} placeholder="Brand" />

          <label>Description</label>
          <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" />

          <label>Price (ETB)</label>
          <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price" required min="0" />

          <label>Stock</label>
          <input type="number" name="stock" value={product.stock} onChange={handleChange} placeholder="Stock" required min="0" />

          <label>Product Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImage} />

          {preview.length > 0 && (
            <div className="image-preview">
              {preview.map((img, i) => (
                <img key={i} src={img.startsWith("blob") ? img : getImageUrl(img)} alt="preview" />
              ))}
            </div>
          )}

          <button type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditProduct;
