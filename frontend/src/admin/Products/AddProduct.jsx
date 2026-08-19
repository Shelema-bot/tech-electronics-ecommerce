import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();
  const toast = useToast();

  const [image, setImage]         = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [product, setProduct]     = useState({
    name: "", category: "", brand: "", description: "", price: "", stock: "",
  });

  useEffect(() => {
    API.get("/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(product).forEach(k => fd.append(k, product[k]));
      if (image) fd.append("images", image);
      await API.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Product added successfully");
      setProduct({ name: "", category: "", brand: "", description: "", price: "", stock: "" });
      setImage(null);
      navigate("/admin/products");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-product">
        <h1>Add New Product</h1>
        <form onSubmit={submitProduct}>
          <label>Product Name</label>
          <input name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required />

          <label>Category</label>
          <select name="category" value={product.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>

          <label>Brand</label>
          <input name="brand" placeholder="Brand" value={product.brand} onChange={handleChange} />

          <label>Description</label>
          <textarea name="description" placeholder="Product description" value={product.description} onChange={handleChange} />

          <label>Price (ETB)</label>
          <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} required min="0" />

          <label>Stock</label>
          <input type="number" name="stock" placeholder="Stock quantity" value={product.stock} onChange={handleChange} required min="0" />

          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddProduct;
