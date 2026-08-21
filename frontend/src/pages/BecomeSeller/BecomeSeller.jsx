import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./BecomeSeller.css";

const BENEFITS = [
  { icon: "🏪", title: "Your Own Storefront", desc: "List your products and reach thousands of buyers" },
  { icon: "💰", title: "Earn Revenue",        desc: "Set your own prices and grow your business" },
  { icon: "📦", title: "Easy Management",     desc: "Manage inventory and orders from one dashboard" },
  { icon: "🔒", title: "Secure Payments",     desc: "Get paid securely through Chapa integration" },
];

function BecomeSeller() {
  const toast = useToast();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ businessName: "", nationalIdNumber: "" });
  const [idImage, setIdImage]   = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) { toast.warning("Business name is required"); return; }
    if (!form.nationalIdNumber.trim()) { toast.warning("National ID number is required"); return; }
    if (!idImage) { toast.warning("Please upload your national ID image"); return; }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("businessName",    form.businessName);
      fd.append("nationalIdNumber", form.nationalIdNumber);
      fd.append("nationalIdImage", idImage);

      const res = await API.post("/staff/apply-seller", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Application submitted! Awaiting super admin verification.");

      // Update stored user role
      const updatedUser = { ...user, role: "seller", staffInfo: res.data.user?.staffInfo };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("loginStatusChanged"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  const status = user?.staffInfo?.verificationStatus;

  const renderStatus = () => {
    if (status === "pending") return (
      <div className="seller-status-card">
        <div className="seller-status-icon">⏳</div>
        <h2>Application Under Review</h2>
        <p>Your seller application is being reviewed by our team.</p>
        <p style={{ color: "#2563eb", fontWeight: 600 }}>We'll notify you once verified.</p>
      </div>
    );
    if (status === "verified") return (
      <div className="seller-status-card">
        <div className="seller-status-icon">✅</div>
        <h2>Verified Seller!</h2>
        <p>You're approved. Go to your admin panel to start listing products.</p>
        <a href="/admin" style={{ display:"inline-block", marginTop:16, padding:"11px 28px", background:"#16a34a", color:"white", borderRadius:8, fontWeight:700, textDecoration:"none" }}>
          Go to Seller Dashboard
        </a>
      </div>
    );
    if (status === "rejected") return (
      <div className="seller-status-card">
        <div className="seller-status-icon">❌</div>
        <h2>Application Rejected</h2>
        <p>Unfortunately your application was not approved.</p>
        {user?.staffInfo?.verificationNote && (
          <p style={{ background:"#fee2e2", color:"#dc2626", padding:"10px 14px", borderRadius:8, marginTop:8, fontSize:13 }}>
            Reason: {user.staffInfo.verificationNote}
          </p>
        )}
      </div>
    );
    return null;
  };

  if (user?.role === "seller" && status) {
    return (
      <AccountLayout>
        <div className="become-seller">
          <div className="become-seller-container">
            <div className="become-seller-hero">
              <h1>Seller Status</h1>
            </div>
            {renderStatus()}
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="become-seller">
        <div className="become-seller-container">

          <div className="become-seller-hero">
            <h1>Become a Seller</h1>
            <p>Join our marketplace and sell your products to thousands of tech enthusiasts</p>
          </div>

          <div className="seller-benefits">
            {BENEFITS.map((b, i) => (
              <div className="seller-benefit" key={i}>
                <div className="seller-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="seller-form-card">
            <h2>Apply to Become a Seller</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="businessName">Business / Store Name *</label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Abebe Tech Store"
                  value={form.businessName}
                  onChange={e => setForm({ ...form, businessName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="nationalIdNumber">National ID / Trade License Number *</label>
                <input
                  id="nationalIdNumber"
                  type="text"
                  placeholder="Your national ID or business license number"
                  value={form.nationalIdNumber}
                  onChange={e => setForm({ ...form, nationalIdNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="idImage">National ID / Identity Document Image *</label>
                <input
                  id="idImage"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setIdImage(e.target.files[0])}
                  required
                />
                <p style={{ fontSize:"12px", color:"#94a3b8", marginTop:4 }}>
                  Upload a clear photo of your national ID, passport, or trade license. This is required for verification.
                </p>
              </div>
              <button type="submit" className="seller-submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </AccountLayout>
  );
}

export default BecomeSeller;
