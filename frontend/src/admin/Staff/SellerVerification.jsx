import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./SellerVerification.css";

function SellerVerification() {
  const toast = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes]     = useState({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/verifications/pending");
      setSellers(res.data.sellers || []);
    } catch (err) {
      toast.error("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (id, status) => {
    try {
      await API.put(`/staff/verify/${id}`, { status, note: notes[id] || "" });
      toast.success(`Seller ${status}`);
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <AdminLayout>
      <div className="verify-page">

        <div className="verify-header">
          <h1>Seller Verification</h1>
          <p>Review and verify seller applications with their national ID</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>Loading pending verifications...</div>
        ) : sellers.length === 0 ? (
          <div className="verify-empty">
            <div className="verify-empty-icon">✅</div>
            <h3>All caught up!</h3>
            <p>No pending seller verifications at the moment.</p>
          </div>
        ) : (
          <div className="verify-list">
            {sellers.map(seller => (
              <div className="verify-card" key={seller._id}>
                <div className="verify-card-top">
                  <div className="verify-user">
                    <div className="verify-avatar">{seller.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="verify-name">{seller.name}</div>
                      <div className="verify-email">{seller.email}</div>
                    </div>
                  </div>
                  <span style={{
                    background: "#fef9c3", color: "#a16207",
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: "700"
                  }}>
                    Pending Verification
                  </span>
                </div>

                <div className="verify-details">
                  <div className="verify-row">
                    <span className="verify-label">Business Name</span>
                    <span>{seller.staffInfo?.businessName || "—"}</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">National ID No.</span>
                    <span>{seller.staffInfo?.nationalIdNumber || "—"}</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">Applied</span>
                    <span>
                      {seller.staffInfo?.appliedAt
                        ? new Date(seller.staffInfo.appliedAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">Phone</span>
                    <span>{seller.phone || "—"}</span>
                  </div>

                  {/* National ID image */}
                  {seller.staffInfo?.nationalIdImage && (
                    <div className="verify-id-img">
                      <img
                        src={seller.staffInfo.nationalIdImage}
                        alt="National ID"
                      />
                    </div>
                  )}
                </div>

                <div className="verify-actions">
                  <textarea
                    className="verify-note"
                    rows="2"
                    placeholder="Optional note (rejection reason, etc.)..."
                    value={notes[seller._id] || ""}
                    onChange={e => setNotes({ ...notes, [seller._id]: e.target.value })}
                  />
                  <button className="approve-btn" onClick={() => verify(seller._id, "verified")}>
                    ✓ Approve Seller
                  </button>
                  <button className="reject-btn" onClick={() => verify(seller._id, "rejected")}>
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

export default SellerVerification;
