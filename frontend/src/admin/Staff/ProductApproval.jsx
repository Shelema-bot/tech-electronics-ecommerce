import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./SellerVerification.css";

function ProductApproval() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notes, setNotes]       = useState({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/products/pending");
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error("Failed to load pending products");
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, status) => {
    try {
      await API.put(`/staff/products/${id}/approve`, { status, note: notes[id] || "" });
      toast.success(`Product ${status}`);
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="verify-page">
        <div className="verify-header">
          <h1>Product Approval</h1>
          <p>Review and approve or reject products submitted by sellers</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>Loading pending products...</div>
        ) : products.length === 0 ? (
          <div className="verify-empty">
            <div className="verify-empty-icon">📦</div>
            <h3>No pending products</h3>
            <p>All seller products have been reviewed.</p>
          </div>
        ) : (
          <div className="verify-list">
            {products.map(p => (
              <div className="verify-card" key={p._id}>
                <div className="verify-card-top">
                  <div className="verify-user">
                    {p.images?.[0] && (
                      <img
                        src={getImageUrl(p.images[0])}
                        alt={p.name}
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }}
                      />
                    )}
                    <div>
                      <div className="verify-name">{p.name}</div>
                      <div className="verify-email">{p.category} · {p.brand}</div>
                    </div>
                  </div>
                  <span style={{
                    background: "#fef9c3", color: "#a16207",
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: "700"
                  }}>
                    Pending Review
                  </span>
                </div>

                <div className="verify-details">
                  <div className="verify-row">
                    <span className="verify-label">Price</span>
                    <span>{Number(p.price).toLocaleString()} ETB</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">Stock</span>
                    <span>{p.stock}</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">Seller</span>
                    <span>{p.submittedBy?.name || "—"} ({p.submittedBy?.email || ""})</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">Business</span>
                    <span>{p.submittedBy?.staffInfo?.businessName || "—"}</span>
                  </div>
                  {p.description && (
                    <div className="verify-row">
                      <span className="verify-label">Description</span>
                      <span style={{ flex: 1 }}>{p.description}</span>
                    </div>
                  )}
                </div>

                <div className="verify-actions">
                  <textarea
                    className="verify-note"
                    rows="2"
                    placeholder="Optional note for seller..."
                    value={notes[p._id] || ""}
                    onChange={e => setNotes({ ...notes, [p._id]: e.target.value })}
                  />
                  <button className="approve-btn" onClick={() => decide(p._id, "approved")}>
                    ✓ Approve & Publish
                  </button>
                  <button className="reject-btn" onClick={() => decide(p._id, "rejected")}>
                    ✗ Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ProductApproval;
