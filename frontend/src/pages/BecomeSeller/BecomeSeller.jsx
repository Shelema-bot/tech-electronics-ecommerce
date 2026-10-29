import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import {
  FaShieldAlt,
  FaStore,
  FaFileInvoice,
  FaMapMarkerAlt,
  FaUniversity,
  FaCheckCircle,
  FaUpload,
  FaExclamationTriangle,
  FaUserShield,
} from "react-icons/fa";
import "./BecomeSeller.css";

const CATEGORY_OPTIONS = [
  "Laptops",
  "Smartphones",
  "Gaming",
  "Smart Watch",
  "Headphones & Audio",
  "Tablets",
  "Cameras",
  "Drones",
  "Smart Accessories",
  "Network",
  "Printers & Scanners",
  "Smart Home",
];

const ETH_BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Telebirr Mobile Money",
  "Bank of Abyssinia (BOA)",
  "Awash Bank",
  "Dashen Bank",
  "Cooperative Bank of Oromia (Coop)",
  "Wegagen Bank",
  "Hibret Bank",
  "Nib International Bank",
];

const ADDIS_SUBCITIES = [
  "Bole",
  "Kirkos",
  "Yeka",
  "Arada",
  "Lideta",
  "Nifas Silk-Lafto",
  "Kolfe Keranio",
  "Gulele",
  "Addis Ketema",
  "Akaki Kality",
  "Lemi Kura",
  "Outside Addis Ababa / Regional",
];

function BecomeSeller() {
  const toast = useToast();
  const { t } = useTranslation();

  const benefits = [
    { icon: "🏪", title: t("seller.storefront", "Your Own Storefront"), desc: t("seller.storefrontDesc", "List certified products and reach thousands of verified buyers") },
    { icon: "🛡️", title: t("seller.verifiedBadge", "Verified Merchant Badge"), desc: t("seller.verifiedBadgeDesc", "Gain immediate customer trust with identity & license verification") },
    { icon: "📦", title: t("seller.easyManagement", "Logistics & Inventory"), desc: t("seller.easyManagementDesc", "Fulfill orders with platform delivery dispatch & real-time inventory tracking") },
    { icon: "💳", title: t("seller.directPayouts", "Direct Bank Payouts"), desc: t("seller.directPayoutsDesc", "Fast settlement to CBE, Telebirr, BOA, or Awash Bank accounts") },
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const [tradeLicenseImage, setTradeLicenseImage] = useState(null);

  const [form, setForm] = useState({
    businessName: "",
    legalRepresentative: "",
    businessType: "Sole Proprietorship",
    tinNumber: "",
    tradeLicenseNumber: "",
    idType: "National ID",
    nationalIdNumber: "",
    businessPhone: "",
    altPhone: "",
    businessEmail: "",
    city: "Addis Ababa",
    subcity: "Bole",
    woredaKebele: "",
    physicalAddress: "",
    payoutBank: "Commercial Bank of Ethiopia (CBE)",
    bankAccountHolder: "",
    bankAccountNumber: "",
    plannedCategories: ["Laptops", "Smartphones"],
    termsAccepted: false,
    antiFraudAccepted: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        setForm((prev) => ({
          ...prev,
          legalRepresentative: u.name || "",
          businessPhone: u.phone || "",
          businessEmail: u.email || "",
          bankAccountHolder: u.name || "",
        }));
      } catch (e) {}
    }
  }, []);

  const handleCategoryToggle = (cat) => {
    setForm((prev) => {
      const exists = prev.plannedCategories.includes(cat);
      if (exists) {
        if (prev.plannedCategories.length === 1) return prev;
        return {
          ...prev,
          plannedCategories: prev.plannedCategories.filter((c) => c !== cat),
        };
      } else {
        return {
          ...prev,
          plannedCategories: [...prev.plannedCategories, cat],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.businessName.trim()) {
      toast.warning(t("seller.businessNameRequired", "Business / Store name is required"));
      return;
    }
    if (!form.legalRepresentative.trim()) {
      toast.warning(t("seller.legalNameRequired", "Legal representative full name is required"));
      return;
    }
    if (!form.nationalIdNumber.trim()) {
      toast.warning(t("seller.nationalIdRequired", "National ID number is required"));
      return;
    }
    if (!idImage) {
      toast.warning(t("seller.idImageRequired", "Please upload a clear photo of your National ID or Passport"));
      return;
    }
    if (!form.businessPhone.trim()) {
      toast.warning(t("seller.phoneRequired", "Official contact phone number is required"));
      return;
    }
    if (!form.physicalAddress.trim()) {
      toast.warning(t("seller.addressRequired", "Physical store/office address is required"));
      return;
    }
    if (!form.bankAccountNumber.trim()) {
      toast.warning(t("seller.bankAccountRequired", "Bank Account Number or Telebirr Phone is required for payouts"));
      return;
    }
    if (!form.termsAccepted) {
      toast.warning(t("seller.termsRequired", "You must accept the Marketplace Seller Agreement"));
      return;
    }
    if (!form.antiFraudAccepted) {
      toast.warning(t("seller.antiFraudRequired", "You must accept the Anti-Counterfeit & Warranty commitment"));
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "plannedCategories") {
          fd.append(key, JSON.stringify(val));
        } else {
          fd.append(key, val);
        }
      });

      if (idImage) fd.append("nationalIdImage", idImage);
      if (tradeLicenseImage) fd.append("tradeLicenseImage", tradeLicenseImage);

      const res = await API.post("/staff/apply-seller", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        t(
          "seller.appSubmitted",
          "Comprehensive seller dossier submitted! Super Admin Shelema will verify your credentials."
        )
      );

      const updatedUser = {
        ...user,
        role: "seller",
        staffInfo: res.data.user?.staffInfo,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("loginStatusChanged"));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          t("seller.appFailed", "Application submission failed. Please verify required fields.")
      );
    } finally {
      setLoading(false);
    }
  };

  const status = user?.staffInfo?.verificationStatus;

  const renderStatus = () => {
    if (status === "pending")
      return (
        <div className="seller-status-card">
          <div className="seller-status-icon">⏳</div>
          <h2>{t("seller.underReview", "Seller Dossier Under Super Admin Review")}</h2>
          <p className="seller-status-desc">
            {t(
              "seller.underReviewDesc",
              "Your verified seller application and legal credentials have been securely stored and sent to Super Admin Shelema."
            )}
          </p>

          <div className="seller-dossier-preview">
            <div className="dossier-row">
              <span>🏪 Store Name:</span>
              <strong>{user?.staffInfo?.businessName || "—"}</strong>
            </div>
            <div className="dossier-row">
              <span>👤 Legal Representative:</span>
              <strong>{user?.staffInfo?.legalRepresentative || user?.name || "—"}</strong>
            </div>
            <div className="dossier-row">
              <span>🆔 ID Document No:</span>
              <strong>{user?.staffInfo?.nationalIdNumber || "—"}</strong>
            </div>
            {user?.staffInfo?.tinNumber && (
              <div className="dossier-row">
                <span>📄 TIN Number:</span>
                <strong>{user.staffInfo.tinNumber}</strong>
              </div>
            )}
            <div className="dossier-row">
              <span>💳 Payout Account:</span>
              <strong>
                {user?.staffInfo?.payoutBank} - {user?.staffInfo?.bankAccountNumber || "—"}
              </strong>
            </div>
          </div>

          <p style={{ color: "#2563eb", fontWeight: 700, marginTop: 14 }}>
            {t("seller.weWillNotify", "You will be notified as soon as your account is approved.")}
          </p>
        </div>
      );

    if (status === "verified")
      return (
        <div className="seller-status-card verified">
          <div className="seller-status-icon">✅</div>
          <h2>{t("seller.verifiedSeller", "Verified Merchant Approved!")}</h2>
          <p>
            {t(
              "seller.verifiedSellerDesc",
              "Your seller credentials have been verified by Super Admin Shelema. You can now submit products, manage orders, and view sales analytics."
            )}
          </p>
          <Link
            to="/admin"
            style={{
              display: "inline-block",
              marginTop: 18,
              padding: "12px 30px",
              background: "#16a34a",
              color: "white",
              borderRadius: 8,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            {t("seller.goToSellerDashboard", "Open Seller Dashboard →")}
          </Link>
        </div>
      );

    if (status === "rejected")
      return (
        <div className="seller-status-card rejected">
          <div className="seller-status-icon">❌</div>
          <h2>{t("seller.rejected", "Application Not Approved")}</h2>
          <p>{t("seller.rejectedDesc", "Unfortunately, your application did not pass verification.")}</p>
          {user?.staffInfo?.verificationNote && (
            <p
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "12px 16px",
                borderRadius: 8,
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Reason: {user.staffInfo.verificationNote}
            </p>
          )}
          <button
            type="button"
            className="seller-reapply-btn"
            onClick={() => {
              const u = {
                ...user,
                staffInfo: { ...user.staffInfo, verificationStatus: null },
              };
              setUser(u);
            }}
          >
            🔄 Edit Information &amp; Re-apply
          </button>
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
              <span className="seller-hero-badge">🔐 VERIFIED MARKETPLACE</span>
              <h1>{t("seller.sellerStatus", "Seller Application Status")}</h1>
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
          {/* Hero Header */}
          <div className="become-seller-hero">
            <span className="seller-hero-badge">🛡️ SECURE SELLER ONBOARDING</span>
            <h1>{t("seller.becomeSeller", "Become a Verified Merchant")}</h1>
            <p>
              {t(
                "seller.heroDesc",
                "Join Ethiopia's leading technology marketplace. Complete the verified seller registration to start selling 100% genuine consumer electronics."
              )}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="seller-benefits">
            {benefits.map((b, i) => (
              <div className="seller-benefit" key={i}>
                <div className="seller-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Comprehensive Secure Registration Form */}
          <div className="seller-form-card">
            <div className="seller-form-header">
              <div className="seller-form-title-wrap">
                <FaUserShield className="seller-form-shield-icon" />
                <div>
                  <h2>{t("seller.applyTitle", "Verified Seller Application Form")}</h2>
                  <p className="seller-form-subtitle">
                    {t(
                      "seller.secureFormSub",
                      "All business credentials and identification are encrypted and reviewed exclusively by Super Admin Shelema."
                    )}
                  </p>
                </div>
              </div>
              <div className="seller-security-tag">
                <FaShieldAlt /> 256-Bit Encrypted Dossier
              </div>
            </div>

            <form onSubmit={handleSubmit} className="seller-full-form">
              {/* ── SECTION 1: Business Profile ── */}
              <div className="seller-section-box">
                <div className="seller-section-title">
                  <FaStore />
                  <span>1. Business Profile &amp; Store Information</span>
                </div>
                <div className="seller-grid-2">
                  <div>
                    <label htmlFor="businessName">Store / Business Name *</label>
                    <input
                      id="businessName"
                      type="text"
                      placeholder="e.g. Addis Tech Hub, Sheger Electronics"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="businessType">Business Entity Type *</label>
                    <select
                      id="businessType"
                      value={form.businessType}
                      onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      required
                    >
                      <option value="Individual">Individual / Freelance Merchant</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Private Limited Company (PLC)">Private Limited Company (PLC)</option>
                      <option value="Authorized Distributor">Authorized Brand Distributor</option>
                      <option value="Electronics Retailer">Electronics Retailer</option>
                    </select>
                  </div>
                </div>

                {/* Categories Planned to Sell */}
                <div className="seller-cat-picker">
                  <label>Select Product Categories You Plan to Sell *</label>
                  <div className="seller-cat-chips">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSel = form.plannedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={`seller-cat-chip ${isSel ? "active" : ""}`}
                          onClick={() => handleCategoryToggle(cat)}
                        >
                          {isSel ? "✓" : "+"} {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Legal & Identity Verification ── */}
              <div className="seller-section-box">
                <div className="seller-section-title">
                  <FaFileInvoice />
                  <span>2. Legal Representative &amp; Identity Verification</span>
                </div>

                <div className="seller-grid-2">
                  <div>
                    <label htmlFor="legalRepresentative">Legal Representative / Owner Full Name *</label>
                    <input
                      id="legalRepresentative"
                      type="text"
                      placeholder="Full name as written on ID"
                      value={form.legalRepresentative}
                      onChange={(e) => setForm({ ...form, legalRepresentative: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="idType">Identity Document Type *</label>
                    <select
                      id="idType"
                      value={form.idType}
                      onChange={(e) => setForm({ ...form, idType: e.target.value })}
                      required
                    >
                      <option value="National ID">Ethiopian National ID (Fayda / Digital ID)</option>
                      <option value="Kebele ID">Kebele Resident ID</option>
                      <option value="Passport">Ethiopian Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nationalIdNumber">Identity Document / National ID Number *</label>
                    <input
                      id="nationalIdNumber"
                      type="text"
                      placeholder="e.g. ET-ID-12345678"
                      value={form.nationalIdNumber}
                      onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tinNumber">TIN Number (Tax Identification Number)</label>
                    <input
                      id="tinNumber"
                      type="text"
                      placeholder="10-digit TIN number (if registered business)"
                      value={form.tinNumber}
                      onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="tradeLicenseNumber">Trade License / Commercial Registration No.</label>
                    <input
                      id="tradeLicenseNumber"
                      type="text"
                      placeholder="e.g. BL/AA/12345/2016"
                      value={form.tradeLicenseNumber}
                      onChange={(e) => setForm({ ...form, tradeLicenseNumber: e.target.value })}
                    />
                  </div>
                </div>

                {/* File Uploads for ID & Trade License */}
                <div className="seller-upload-grid">
                  <div className="seller-upload-box">
                    <label className="seller-upload-label">
                      <FaUpload />
                      <span>Upload National ID / Passport Photo *</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdImage(e.target.files[0])}
                      required
                    />
                    {idImage ? (
                      <span className="seller-upload-file-name">✅ {idImage.name}</span>
                    ) : (
                      <span className="seller-upload-hint">Front side or clear photo of your government ID</span>
                    )}
                  </div>

                  <div className="seller-upload-box">
                    <label className="seller-upload-label">
                      <FaUpload />
                      <span>Upload Trade License / Business Document (Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setTradeLicenseImage(e.target.files[0])}
                    />
                    {tradeLicenseImage ? (
                      <span className="seller-upload-file-name">✅ {tradeLicenseImage.name}</span>
                    ) : (
                      <span className="seller-upload-hint">Trade license copy (Required for Registered Companies)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: Location & Contact Details ── */}
              <div className="seller-section-box">
                <div className="seller-section-title">
                  <FaMapMarkerAlt />
                  <span>3. Physical Store / Office Location &amp; Contact</span>
                </div>

                <div className="seller-grid-3">
                  <div>
                    <label htmlFor="businessPhone">Official Phone Number *</label>
                    <input
                      id="businessPhone"
                      type="tel"
                      placeholder="+251 9..."
                      value={form.businessPhone}
                      onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="altPhone">Alternate WhatsApp / Backup Phone</label>
                    <input
                      id="altPhone"
                      type="tel"
                      placeholder="+251 9..."
                      value={form.altPhone}
                      onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessEmail">Official Store Email *</label>
                    <input
                      id="businessEmail"
                      type="email"
                      placeholder="store@domain.com"
                      value={form.businessEmail}
                      onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="city">City / Region *</label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Addis Ababa, Hawassa, etc."
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subcity">Subcity / Zone *</label>
                    <select
                      id="subcity"
                      value={form.subcity}
                      onChange={(e) => setForm({ ...form, subcity: e.target.value })}
                      required
                    >
                      {ADDIS_SUBCITIES.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="woredaKebele">Woreda / Kebele</label>
                    <input
                      id="woredaKebele"
                      type="text"
                      placeholder="e.g. Woreda 03, Kebele 12"
                      value={form.woredaKebele}
                      onChange={(e) => setForm({ ...form, woredaKebele: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label htmlFor="physicalAddress">Detailed Physical Store / Warehouse Address *</label>
                  <input
                    id="physicalAddress"
                    type="text"
                    placeholder="e.g. Bole Road, Mega Building 3rd Floor, Shop #304"
                    value={form.physicalAddress}
                    onChange={(e) => setForm({ ...form, physicalAddress: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ── SECTION 4: Financial & Payout Account ── */}
              <div className="seller-section-box">
                <div className="seller-section-title">
                  <FaUniversity />
                  <span>4. Payout Account &amp; Banking Details</span>
                </div>

                <div className="seller-grid-3">
                  <div>
                    <label htmlFor="payoutBank">Settlement Bank / Payment Rail *</label>
                    <select
                      id="payoutBank"
                      value={form.payoutBank}
                      onChange={(e) => setForm({ ...form, payoutBank: e.target.value })}
                      required
                    >
                      {ETH_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="bankAccountHolder">Bank Account Holder Name *</label>
                    <input
                      id="bankAccountHolder"
                      type="text"
                      placeholder="Must match Legal Representative"
                      value={form.bankAccountHolder}
                      onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="bankAccountNumber">Account Number / Telebirr Phone *</label>
                    <input
                      id="bankAccountNumber"
                      type="text"
                      placeholder="1000... or 09..."
                      value={form.bankAccountNumber}
                      onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: Legal Undertakings & Integrity Agreement ── */}
              <div className="seller-agreements-box">
                <label className="seller-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    required
                  />
                  <span>
                    <strong>Authenticity Declaration:</strong> I hereby certify that all business information,
                    national ID credentials, and documents provided are genuine, unaltered, and belong to me.
                  </span>
                </label>

                <label className="seller-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.antiFraudAccepted}
                    onChange={(e) => setForm({ ...form, antiFraudAccepted: e.target.checked })}
                    required
                  />
                  <span>
                    <strong>Zero-Counterfeit &amp; Warranty Policy:</strong> I agree to sell exclusively 100% genuine
                    electronics, honor manufacturer warranties, and accept immediate account termination if counterfeit
                    items are detected.
                  </span>
                </label>
              </div>

              <div className="seller-submit-row">
                <button type="submit" className="seller-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>⏳ Encrypting &amp; Submitting Dossier...</span>
                  ) : (
                    <span>
                      <FaCheckCircle /> Submit Full Seller Verification Application
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

export default BecomeSeller;
