import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./SellerVerification.css";

function ProductApproval() {
  const toast = useToast();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notes, setNotes]       = useState({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await API.get("/admin/products/pending");
      } catch (err) {
        if (err.response?.status === 404) {
          res = await API.get("/staff/products/pending");
        } else {
          throw err;
        }
      }
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.loadProductsFailed", "Failed to load pending products"));
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, status) => {
    try {
      try {
        await API.put(`/admin/products/${id}/approve`, { status, note: notes[id] || "" });
      } catch (err) {
        if (err.response?.status === 404) {
          await API.put(`/staff/products/${id}/approve`, { status, note: notes[id] || "" });
        } else {
          throw err;
        }
      }
      toast.success(t("admin.productApprovalSuccess", "Product approval status updated!"));
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="verify-page">
        <div className="verify-header">
          <h1>{t("admin.productApprovals", "Product Approval & Catalog Quality")}</h1>
          <p>{t("admin.productApprovalSub", "Review and approve or reject products submitted by verified sellers before publication")}</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>{t("common.loading", "Loading pending products...")}</div>
        ) : products.length === 0 ? (
          <div className="verify-empty">
            <div className="verify-empty-icon">📦</div>
            <h3>{t("admin.noPendingProducts", "No pending products to approve.")}</h3>
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
                      <div className="verify-email">{p.category} · {p.brand || "Unbranded"}</div>
                    </div>
                  </div>
                  <span style={{
                    background: "#fef9c3", color: "#a16207",
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: "700"
                  }}>
                    {t("admin.pending", "Pending Review")}
                  </span>
                </div>

                <div className="verify-details">
                  <div className="verify-row">
                    <span className="verify-label">{t("common.price", "Price")}</span>
                    <strong style={{ color: "#2563eb" }}>{p.price?.toLocaleString()} ETB</strong>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">{t("common.stock", "Stock")}</span>
                    <span>{p.stock} units</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">{t("admin.customer", "Submitted By")}</span>
                    <span>{p.submittedBy?.name || "Seller"} ({p.submittedBy?.email})</span>
                  </div>
                </div>

                {p.description && (
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "10px 0 0", background: "#f8fafc", padding: "8px 12px", borderRadius: 6 }}>
                    {p.description}
                  </p>
                )}

                <div className="verify-actions">
                  <input
                    type="text"
                    placeholder="Optional note / feedback for seller..."
                    value={notes[p._id] || ""}
                    onChange={(e) => setNotes({ ...notes, [p._id]: e.target.value })}
                    className="verify-note-input"
                  />
                  <button
                    className="verify-btn approve"
                    onClick={() => decide(p._id, "approved")}
                  >
                    ✓ {t("admin.approve", "Approve & Publish")}
                  </button>
                  <button
                    className="verify-btn reject"
                    onClick={() => decide(p._id, "rejected")}
                  >
                    ✕ {t("admin.reject", "Reject")}
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
