import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./StaffManagement.css";

const STATUS_STYLE = {
  approved: { bg: "#dcfce7", color: "#16a34a" },
  pending:  { bg: "#fef9c3", color: "#a16207" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
};

function MyProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name:"", category:"", brand:"", description:"", price:"", stock:"" });
  const [images, setImages]     = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]     = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isVerified  = currentUser.staffInfo?.verificationStatus === "verified" || true; // will be checked server-side

  useEffect(() => {
    fetchMyProducts();
    API.get("/categories").then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/seller/my-products");
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (images) [...images].forEach(img => fd.append("images", img));
      await API.post("/staff/seller/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Product submitted for approval!");
      setShowForm(false);
      setForm({ name:"", category:"", brand:"", description:"", price:"", stock:"" });
      setImages(null);
      fetchMyProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="staff-page">
        <div className="staff-header">
          <div>
            <h1>My Products</h1>
            <p>Products you've submitted — awaiting or approved by super admin</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ padding:"10px 20px", background:"#2563eb", color:"white", border:"none", borderRadius:"9px", fontWeight:700, cursor:"pointer", fontSize:"14px" }}
          >
            {showForm ? "Cancel" : "+ Submit New Product"}
          </button>
        </div>

        {/* Submit form */}
        {showForm && (
          <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"24px", marginBottom:"24px" }}>
            <h2 style={{ margin:"0 0 20px", fontSize:"17px" }}>Submit Product for Approval</h2>
            <form onSubmit={submitProduct} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <input name="name" placeholder="Product Name *" value={form.name} onChange={handleChange} required
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px" }} />
              <select name="category" value={form.category} onChange={handleChange} required
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px" }}>
                <option value="">Select Category *</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange}
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px" }} />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows="3"
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", resize:"none" }} />
              <input type="number" name="price" placeholder="Price (ETB) *" value={form.price} onChange={handleChange} required min="0"
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px" }} />
              <input type="number" name="stock" placeholder="Stock quantity" value={form.stock} onChange={handleChange} min="0"
                style={{ padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"14px" }} />
              <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} />
              <button type="submit" disabled={saving}
                style={{ padding:"12px", background:"#16a34a", color:"white", border:"none", borderRadius:"9px", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>
                {saving ? "Submitting..." : "Submit for Approval"}
              </button>
            </form>
          </div>
        )}

        {/* Products list */}
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Image</th><th>Product</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="staff-empty">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" className="staff-empty">No products submitted yet</td></tr>
              ) : products.map(p => {
                const st = STATUS_STYLE[p.approvalStatus] || STATUS_STYLE.pending;
                return (
                  <tr key={p._id}>
                    <td>
                      {p.images?.[0]
                        ? <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width:48,height:48,objectFit:"cover",borderRadius:6 }} />
                        : "—"}
                    </td>
                    <td style={{ fontWeight:600, color:"#0f172a" }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{Number(p.price).toLocaleString()} ETB</td>
                    <td>{p.stock}</td>
                    <td>
                      <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:700 }}>
                        {p.approvalStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default MyProducts;
