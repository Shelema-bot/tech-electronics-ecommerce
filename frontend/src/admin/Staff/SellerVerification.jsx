import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import { isShelema, normalizeRole } from "../AdminRoute";
import "./SellerVerification.css";

function SellerVerification() {
  const toast = useToast();
  const { t } = useTranslation();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes]     = useState({});

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = isShelema(currentUser) && (
    normalizeRole(currentUser.role, currentUser) === "SuperAdmin" ||
    currentUser.role === "super_admin" ||
    currentUser.role === "owner"
  );

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await API.get("/admin/sellers/pending");
      } catch (err) {
        if (err.response?.status === 404) {
          res = await API.get("/staff/verifications/pending");
        } else {
          throw err;
        }
      }
      setSellers(res.data.sellers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.loadVerificationsFailed", "Failed to load pending verifications"));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (id, status) => {
    if (!isOwner) {
      toast.error(t("admin.ownerOnlySellerApproval", "403 Forbidden: Only the owner (sole Super Admin Shelema) can approve sellers."));
      return;
    }
    try {
      try {
        await API.put(`/admin/sellers/${id}/approve`, { status, note: notes[id] || "" });
      } catch (err) {
        if (err.response?.status === 404) {
          await API.put(`/staff/verify/${id}`, { status, note: notes[id] || "" });
        } else {
          throw err;
        }
      }
      toast.success(t("admin.sellerStatusSuccess", "Seller status updated successfully!"));
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.actionForbidden", "Action failed: 403 Forbidden"));
    }
  };

  return (
    <AdminLayout>
      <div className="verify-page">

        <div className="verify-header">
          <h1>{t("admin.sellerApprovals", "Seller Verification & Approvals")}</h1>
          <p>{t("admin.sellerApprovalSub", "Review and verify new seller applications with their business credentials and national ID")}</p>
        </div>

        {/* Owner Restriction Notice if viewing as non-owner */}
        {!isOwner && (
          <div style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            color: "#92400e",
            padding: "14px 18px",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            <span style={{ fontSize: "22px" }}>🔒</span>
            <div>
              <strong>{t("admin.ownerOnlyLockTitle", "Strict RBAC Policy")}:</strong> {t("admin.ownerOnlyLockMessage", "Seller approvals are exclusively locked to the owner (sole Super Admin Shelema). Other administrative roles are restricted to view-only mode.")}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>{t("common.loading", "Loading pending verifications...")}</div>
        ) : sellers.length === 0 ? (
          <div className="verify-empty">
            <div className="verify-empty-icon">✅</div>
            <h3>{t("admin.noPendingSellers", "No pending seller applications.")}</h3>
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
                    {t("admin.pending", "Pending Verification")}
                  </span>
                </div>

                <div className="verify-details">
                  <div className="verify-row">
                    <span className="verify-label">{t("admin.businessName", "Business Name")}</span>
                    <span>{seller.staffInfo?.businessName || "—"}</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">{t("admin.nationalId", "National ID No.")}</span>
                    <span>{seller.staffInfo?.nationalIdNumber || "—"}</span>
                  </div>
                  <div className="verify-row">
                    <span className="verify-label">{t("common.date", "Applied")}</span>
                    <span>
                      {seller.staffInfo?.appliedAt
                        ? new Date(seller.staffInfo.appliedAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>

                {seller.staffInfo?.nationalIdImage && (
                  <div className="verify-id-preview">
                    <p style={{ fontWeight: 600, fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                      {t("admin.idDocument", "National ID / Document")}:
                    </p>
                    <a
                      href={getImageUrl(seller.staffInfo.nationalIdImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={getImageUrl(seller.staffInfo.nationalIdImage)}
                        alt="National ID"
                        className="verify-id-img"
                      />
                    </a>
                  </div>
                )}

                <div className="verify-actions">
                  <input
                    type="text"
                    placeholder="Optional note / reason..."
                    value={notes[seller._id] || ""}
                    onChange={(e) => setNotes({ ...notes, [seller._id]: e.target.value })}
                    className="verify-note-input"
                    disabled={!isOwner}
                  />
                  <button
                    className="verify-btn approve"
                    onClick={() => verify(seller._id, "verified")}
                    disabled={!isOwner}
                    style={!isOwner ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    title={!isOwner ? "Only the owner (Shelema) can approve sellers" : "Approve"}
                  >
                    ✓ {t("admin.approve", "Approve")}
                  </button>
                  <button
                    className="verify-btn reject"
                    onClick={() => verify(seller._id, "rejected")}
                    disabled={!isOwner}
                    style={!isOwner ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                    title={!isOwner ? "Only the owner (Shelema) can reject sellers" : "Reject"}
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

export default SellerVerification;
