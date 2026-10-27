import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { usePreference } from "../../context/PreferenceContext";
import API from "../../api/axios";
import "./Checkout.css";

const METHOD_ICONS = {
  chapa:            "💳",
  cod:              "💵",
  cash_on_delivery: "💵",
  telebirr:         "📱",
  cbe_birr:         "🏦",
  cbe:              "🏦",
  boa:              "🏛️",
  awash:            "🏦",
  dashen:           "🏦",
  manual:           "📱",
};

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const toast    = useToast();
  const { fmt }  = usePreference();
  const { t }    = useTranslation();

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [methods, setMethods]           = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode]       = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount]           = useState(0);
  const finalTotal = cartTotal - discount;

  // Manual payment proof state
  const [proofStep, setProofStep]             = useState(false);
  const [paymentId, setPaymentId]             = useState(null);
  const [methodInfo, setMethodInfo]           = useState(null);
  const [txRef, setTxRef]                     = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [proofFile, setProofFile]             = useState(null);
  const [note, setNote]                       = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [orderAmount, setOrderAmount]         = useState(cartTotal);

  const [shipping, setShipping] = useState({
    fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Ethiopia",
  });

  // Load payment methods from backend
  useEffect(() => {
    API.get("/payments/methods")
      .then(res => {
        const ms = res.data.methods || [];
        setMethods(ms);
        if (ms.length > 0) setSelectedMethod(ms[0].code);
      })
      .catch(() => {
        const fallback = [
          { _id:"chapa",    code:"chapa",    name:"Chapa Payment",      type:"chapa",            enabled:true, requiresScreenshot:false, requiresReference:false, description:"Pay online with Chapa (Cards, Telebirr, CBE)" },
          { _id:"cbe_birr", code:"cbe_birr", name:"CBE Birr",            type:"manual",           enabled:true, requiresScreenshot:true,  requiresReference:true,  description:"Commercial Bank of Ethiopia transfer", accountName:"Tech Electronics Store", accountNumber:"1000456789012", bankName:"Commercial Bank of Ethiopia", instructions:"Transfer to CBE Account 1000456789012 (Tech Electronics Store) and upload receipt screenshot." },
          { _id:"telebirr", code:"telebirr", name:"Telebirr",            type:"manual",           enabled:true, requiresScreenshot:true,  requiresReference:true,  description:"Direct transfer via Telebirr mobile wallet", accountName:"Tech Electronics Store", accountNumber:"0911002233", phoneNumber:"0911002233", bankName:"Telebirr", instructions:"Send money to Telebirr phone 0911002233 (Tech Electronics Store) and submit receipt." },
          { _id:"boa",      code:"boa",      name:"Bank of Abyssinia",  type:"manual",           enabled:true, requiresScreenshot:true,  requiresReference:true,  description:"Bank of Abyssinia mobile banking transfer", accountName:"Tech Electronics Store", accountNumber:"8899001122", bankName:"Bank of Abyssinia", instructions:"Transfer to BoA Account 8899001122 (Tech Electronics Store) and submit receipt." },
          { _id:"awash",    code:"awash",    name:"Awash Bank",         type:"manual",           enabled:true, requiresScreenshot:true,  requiresReference:true,  description:"Awash Bank mobile or branch transfer", accountName:"Tech Electronics Store", accountNumber:"01320876543200", bankName:"Awash Bank", instructions:"Transfer to Awash Bank Account 01320876543200 (Tech Electronics Store) and submit receipt." },
          { _id:"dashen",   code:"dashen",   name:"Dashen Bank",        type:"manual",           enabled:true, requiresScreenshot:true,  requiresReference:true,  description:"Dashen Bank / Amole mobile banking transfer", accountName:"Tech Electronics Store", accountNumber:"556677889900", bankName:"Dashen Bank", instructions:"Transfer to Dashen Bank Account 556677889900 (Tech Electronics Store) and submit receipt." },
          { _id:"cod",      code:"cod",      name:"Cash on Delivery",    type:"cash_on_delivery", enabled:true, requiresScreenshot:false, requiresReference:false, description:"Pay with cash upon delivery" },
        ];
        setMethods(fallback);
        setSelectedMethod("chapa");
      })
      .finally(() => setMethodsLoading(false));
  }, []);

  // Clear any stale cached references on checkout mount
  useEffect(() => {
    localStorage.removeItem("pendingTxRef");
    localStorage.removeItem("pendingPaymentId");
    localStorage.removeItem("pendingOrder");
  }, []);

  // Reset payment proof inputs and error when switching payment methods
  useEffect(() => {
    setTxRef("");
    setReceiptImageUrl("");
    setProofFile(null);
    setError(null);
  }, [selectedMethod]);

  const handleChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.warning(t("checkout.enterCoupon", "Enter a coupon code")); return; }
    try {
      setCouponLoading(true);
      const res = await API.post("/coupons/validate", { code: couponCode, orderAmount: cartTotal });
      setAppliedCoupon(res.data.coupon);
      setDiscount(res.data.discount);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setDiscount(0); setCouponCode(""); };

  const currentMethod = methods.find(m => m.code === selectedMethod);

  const validateShipping = () => {
    if (!shipping.fullName?.trim()) {
      toast.warning(t("checkout.errFullName", "Please enter your full name"));
      return false;
    }
    if (!shipping.phone?.trim()) {
      toast.warning(t("checkout.errPhone", "Please enter your phone number"));
      return false;
    }
    const cleanPhone = shipping.phone.trim().replace(/[\s-]/g, "");
    if (cleanPhone.length < 8) {
      toast.warning(t("checkout.errPhoneValid", "Please enter a valid phone number (at least 8 digits)"));
      return false;
    }
    if (!shipping.address?.trim()) {
      toast.warning(t("checkout.errAddress", "Please enter your street delivery address"));
      return false;
    }
    if (!shipping.city?.trim()) {
      toast.warning(t("checkout.errCity", "Please enter your city"));
      return false;
    }
    return true;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError(null);
    if (cartItems.length === 0) { toast.warning(t("cart.empty", "Your cart is empty")); return; }
    if (!localStorage.getItem("token")) { toast.warning(t("checkout.errLoginRequired", "Please login before checkout")); navigate("/login"); return; }
    if (!selectedMethod) { toast.warning(t("checkout.errSelectMethod", "Please select a payment method")); return; }

    if (!validateShipping()) return;
    if (loading) return;

    try {
      setLoading(true);

      const orderRes = await API.post("/orders", {
        orderItems: cartItems.map(item => ({
          product: item._id || item.product || item.id,
          name: item.name,
          image: item.images?.[0] || "",
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
        })),
        shippingAddress: {
          fullName: shipping.fullName.trim(),
          phone: shipping.phone.trim(),
          address: shipping.address.trim(),
          city: shipping.city.trim(),
          postalCode: shipping.postalCode?.trim() || "",
          country: shipping.country?.trim() || "Ethiopia",
        },
        paymentMethod: currentMethod?.name || (selectedMethod === "chapa" ? "Chapa" : selectedMethod === "cod" ? "Cash on Delivery" : selectedMethod),
        transactionId: txRef.trim() || undefined,
        transactionRef: txRef.trim() || undefined,
        receiptImage: receiptImageUrl.trim() || undefined,
        itemsPrice: cartTotal,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: finalTotal,
      });

      const orderId = orderRes.data.order?._id || orderRes.data._id;
      if (!orderId) throw new Error("Order ID was not returned by server");

      if (orderRes.data.isDuplicate) {
        toast.info(orderRes.data.message || t("checkout.orderAlreadyRecorded", "Your order was already recorded."));
        clearCart();
        localStorage.removeItem("cartItems");
        navigate(`/order-success?id=${orderId}`);
        return;
      }

      setOrderAmount(finalTotal);

      // If manual transfer and proof was already provided on checkout form
      if ((selectedMethod !== "chapa" && selectedMethod !== "cod") && (proofFile || receiptImageUrl.trim())) {
        try {
          const fd = new FormData();
          if (txRef.trim()) {
            fd.append("transactionReference", txRef.trim());
            fd.append("transactionId", txRef.trim());
          }
          fd.append("customerNote", note.trim());
          if (receiptImageUrl.trim()) fd.append("receiptImage", receiptImageUrl.trim());
          if (proofFile) {
            fd.append("paymentProof", proofFile);
            fd.append("receiptImage", proofFile);
          }
          await API.put(`/payments/${orderId}/proof`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          clearCart();
          localStorage.removeItem("cartItems");
          localStorage.removeItem("pendingPaymentId");
          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("pendingTxRef");
          toast.success(t("checkout.proofSubmittedSuccess", "Payment proof submitted successfully! Your order is pending verification."));
          navigate(`/order-success?id=${orderId}`);
          return;
        } catch (proofErr) {
          console.warn("Direct proof upload fallback:", proofErr);
        }
      }

      // Initialize payment with backend
      let payRes = null;
      try {
        payRes = await API.post("/payment/initialize", {
          orderId,
          methodCode: selectedMethod,
          customer: {
            name: shipping.fullName.trim(),
            phone: shipping.phone.trim(),
          },
        });
      } catch (payErr) {
        console.warn("Payment initialization warning:", payErr);
        if (selectedMethod === "chapa") throw payErr;
        payRes = {
          data: {
            type: selectedMethod === "cod" ? "cash_on_delivery" : "manual",
            paymentId: orderId,
            orderId,
            method: currentMethod || { name: selectedMethod, code: selectedMethod },
          },
        };
      }

      // ── CHAPA ONLINE GATEWAY ──
      if (payRes?.data?.type === "chapa") {
        if (!payRes.data.checkout_url) {
          throw new Error("Payment gateway did not return a checkout URL.");
        }
        localStorage.setItem("pendingOrder", orderId);
        if (payRes.data.tx_ref) {
          localStorage.setItem("pendingTxRef", payRes.data.tx_ref);
        }
        setTimeout(() => setLoading(false), 6000);
        window.location.href = payRes.data.checkout_url;
        return;
      }

      // ── CASH ON DELIVERY (COD) ──
      if (payRes?.data?.type === "cash_on_delivery" || selectedMethod === "cod") {
        clearCart();
        localStorage.removeItem("cartItems");
        toast.success(t("checkout.orderPlacedSuccess", "Order placed successfully! Pay on delivery."));
        navigate(`/payment-success?type=cod&orderId=${orderId}`);
        return;
      }

      // ── MANUAL TRANSFER (CBE Birr, Telebirr, BoA, Awash, Dashen, etc.) ──
      if (payRes?.data?.type === "manual" || currentMethod?.type === "manual") {
        const pId = payRes?.data?.paymentId || orderId;
        setPaymentId(pId);
        localStorage.setItem("pendingPaymentId", pId);
        localStorage.setItem("pendingOrder", orderId);
        setMethodInfo(payRes?.data?.method || currentMethod);
        clearCart();
        localStorage.removeItem("cartItems");
        setProofStep(true);
        toast.info(t("checkout.orderSavedFollow", "Order saved! Please follow the instructions below to complete your payment."));
        return;
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      const msg = err.response?.data?.message || err.message || "Checkout failed. Please check your connection and try again.";
      setError(msg);

      if (err.response?.status === 409) {
        toast.error(t("checkout.orderAlreadyProcessed", "This order was already processed or is pending. Please check your order history."));
        if (msg.toLowerCase().includes("already been paid")) {
          navigate("/my-orders");
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    setError(null);
    if (!proofFile && !receiptImageUrl.trim()) {
      toast.warning(t("checkout.errProofRequired", "Payment screenshot or receipt image URL is required"));
      return;
    }

    try {
      setSubmittingProof(true);
      setLoading(true);

      const targetId = paymentId || localStorage.getItem("pendingPaymentId") || localStorage.getItem("pendingOrder");
      if (!targetId) throw new Error("Order ID not found");

      const fd = new FormData();
      if (txRef.trim()) {
        fd.append("transactionReference", txRef.trim());
        fd.append("transactionId", txRef.trim());
      }
      fd.append("customerNote", note.trim());
      if (receiptImageUrl.trim()) fd.append("receiptImage", receiptImageUrl.trim());
      if (proofFile) {
        fd.append("paymentProof", proofFile);
        fd.append("receiptImage", proofFile);
      }

      await API.put(`/payments/${targetId}/proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t("checkout.proofSubmittedSuccess", "Payment proof submitted successfully! Your order is pending verification."));
      clearCart();
      localStorage.removeItem("cartItems");
      localStorage.removeItem("pendingPaymentId");
      localStorage.removeItem("pendingOrder");
      localStorage.removeItem("pendingTxRef");
      navigate(`/order-success?id=${targetId}`);
    } catch (err) {
      console.error("Proof submission failed:", err);
      const msg = err.response?.data?.message || err.message || "Proof submission failed. Please check your transaction details and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmittingProof(false);
      setLoading(false);
    }
  };

  // ── Manual proof submission step ────────────────────────────────────────────
  const activeMethod = methodInfo || currentMethod;
  if (proofStep && activeMethod) {
    return (
      <div className="checkout-page">
        <div className="checkout-container" style={{ maxWidth: 640 }}>
          <div className="checkout-header">
            <h1>{t("checkout.completeYourPayment", "Complete Your Payment")}</h1>
            <p>{t("checkout.followInstructions", "Follow the instructions below and submit your payment proof")}</p>
          </div>

          {/* Payment instructions */}
          <div className="payment-instruction-card">
            <div className="pic-header">
              <span className="pic-icon">{METHOD_ICONS[selectedMethod] || "💳"}</span>
              <div>
                <h2>{t("checkout.payWith", "Pay with {{method}}", { method: activeMethod.name })}</h2>
                <div className="pic-amount">{t("checkout.amount", "Amount")}: <strong>{fmt(orderAmount)}</strong></div>
              </div>
            </div>

            <div className="pic-details">
              {activeMethod.accountName   && <div className="pic-row"><span>{t("checkout.accountName", "Account Name")}</span><strong>{activeMethod.accountName}</strong></div>}
              {activeMethod.accountNumber && <div className="pic-row"><span>{t("checkout.accountNumber", "Account Number")}</span><strong>{activeMethod.accountNumber}</strong></div>}
              {activeMethod.phoneNumber   && <div className="pic-row"><span>{t("checkout.phoneNumber", "Phone Number")}</span><strong>{activeMethod.phoneNumber}</strong></div>}
              {activeMethod.bankName      && <div className="pic-row"><span>{t("checkout.bank", "Bank")}</span><strong>{activeMethod.bankName}</strong></div>}
            </div>

            {activeMethod.instructions && (
              <div className="pic-instructions">
                <h4>{t("checkout.instructions", "Instructions")}</h4>
                <pre>{activeMethod.instructions}</pre>
              </div>
            )}

            {activeMethod.qrCode && (
              <div className="pic-qr">
                <img src={activeMethod.qrCode} alt="Payment QR Code" />
              </div>
            )}
          </div>

          {/* Proof submission form */}
          <form className="proof-form" onSubmit={submitProof}>
            <h3>{t("checkout.submitPaymentProof", "Submit Payment Proof")}</h3>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 14,
                  border: "1px solid #fecaca",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>{t("checkout.txRef", "Transaction ID / Reference Number (Optional)")}</label>
              <input
                type="text"
                placeholder={t("checkout.txRefPlaceholder", "Enter your transaction reference / ID (optional)")}
                value={txRef}
                onChange={e => { setTxRef(e.target.value); setError(null); }}
              />
            </div>

            <div className="form-group">
              <label>{t("checkout.paymentScreenshot", "Payment Screenshot *")}</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={e => setProofFile(e.target.files[0])}
                  id="proofFile"
                  style={{ display: "none" }}
                />
                <label htmlFor="proofFile" className="file-upload-btn">
                  {proofFile ? `📎 ${proofFile.name}` : `📷 ${t("checkout.chooseScreenshot", "Choose Screenshot")}`}
                </label>
                {proofFile && (
                  <img
                    src={URL.createObjectURL(proofFile)}
                    alt="preview"
                    style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginTop: 8, border: "1px solid #e2e8f0" }}
                  />
                )}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                <span>{t("checkout.orEnterUrl", "Or enter receipt screenshot URL:")}</span>
                <input
                  type="url"
                  placeholder={t("checkout.receiptUrlPlaceholder", "https://example.com/receipt.jpg")}
                  value={receiptImageUrl}
                  onChange={e => setReceiptImageUrl(e.target.value)}
                  style={{ marginTop: 4, width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("checkout.noteOptional", "Note (optional)")}</label>
              <textarea
                placeholder={t("checkout.notePlaceholder", "Any additional notes for the admin...")}
                value={note}
                onChange={e => setNote(e.target.value)}
                rows="2"
              />
            </div>

            <button type="submit" className="checkout-button chapa" disabled={submittingProof || loading}>
              {submittingProof || loading ? t("checkout.submittingProof", "Submitting...") : t("checkout.submitPaymentProof", "Submit Payment Proof")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <h1>{t("checkout.cartEmpty", "Your Cart is Empty")}</h1>
          <p>{t("checkout.cartEmptyMsg", "Add some products before proceeding to checkout.")}</p>
          <Link to="/products">{t("cart.continueShopping", "Continue Shopping")}</Link>
        </div>
      </div>
    );
  }

  // ── Main checkout ────────────────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>{t("checkout.title", "Checkout")}</h1>
          <p>{t("checkout.subtitle", "Complete your shipping information to continue")}</p>
        </div>

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={placeOrder}>

            {/* Shipping */}
            <div className="checkout-section">
              <h2><span className="section-num">1</span> {t("checkout.stepShipping", "Shipping Information")}</h2>
              <div className="form-group">
                <label>{t("checkout.fullName", "Full Name")}</label>
                <input
                  name="fullName"
                  placeholder={t("checkout.fullNamePlaceholder", "Enter your full name")}
                  value={shipping.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("checkout.phone", "Phone Number")}</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder={t("checkout.phonePlaceholder", "e.g. 0912345678")}
                  value={shipping.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t("checkout.address", "Address")}</label>
                <input
                  name="address"
                  placeholder={t("checkout.addressPlaceholder", "Street address")}
                  value={shipping.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t("checkout.city", "City")}</label>
                  <input
                    name="city"
                    placeholder={t("checkout.cityPlaceholder", "City")}
                    value={shipping.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t("checkout.postalCode", "Postal Code")}</label>
                  <input
                    name="postalCode"
                    placeholder={t("checkout.postalCodePlaceholder", "Postal Code")}
                    value={shipping.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t("checkout.country", "Country")}</label>
                <input name="country" value={shipping.country} onChange={handleChange} />
              </div>
            </div>

            {/* Payment Method — loaded from backend */}
            <div className="checkout-section">
              <h2><span className="section-num">2</span> {t("checkout.stepPayment", "Payment Method")}</h2>
              {methodsLoading ? (
                <div style={{ color: "#64748b", padding: "16px 0" }}>{t("checkout.loadingMethods", "Loading payment methods...")}</div>
              ) : (
                <div className="payment-options">
                  {methods.map(method => (
                    <label
                      key={method.code}
                      className={`payment-option ${selectedMethod === method.code ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.code}
                        checked={selectedMethod === method.code}
                        onChange={() => setSelectedMethod(method.code)}
                      />
                      <div className="payment-option-icon">
                        {method.logo ? <img src={method.logo} alt={method.name} style={{ width:28,height:28,objectFit:"contain" }} />
                          : <span>{METHOD_ICONS[method.code] || METHOD_ICONS[method.type] || "💳"}</span>}
                      </div>
                      <div className="payment-option-info">
                        <strong>{method.name}</strong>
                        <span>{method.description || (method.type === "manual" ? "Manual bank/mobile transfer" : "")}</span>
                      </div>
                      {selectedMethod === method.code && <span className="payment-check">✓</span>}
                    </label>
                  ))}
                </div>
              )}

              {/* COD note */}
              {currentMethod?.type === "cash_on_delivery" && (
                <div className="cod-note">
                  <span>🚚</span>
                  <p>{t("checkout.codNote", "Your order will be delivered and you pay in cash on arrival.")}</p>
                </div>
              )}

              {/* Manual method transfer details & proof inputs */}
              {currentMethod?.type === "manual" && (
                <div style={{ marginTop: 14, padding: "16px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{METHOD_ICONS[currentMethod.code] || "🏦"}</span>
                    <div>
                      <strong style={{ fontSize: 15, color: "#1e293b" }}>
                        {t("checkout.transferDetails", "{{method}} Transfer Details", { method: currentMethod.name })}
                      </strong>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {t("checkout.pleaseTransfer", "Please transfer {{amount}} to the account below", { amount: fmt(finalTotal) })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, background: "#ffffff", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                    {currentMethod.accountName && (
                      <div><span style={{ fontSize: 11, color: "#64748b", display: "block" }}>{t("checkout.accountName", "Account Name")}</span><strong style={{ fontSize: 13, color: "#0f172a" }}>{currentMethod.accountName}</strong></div>
                    )}
                    {currentMethod.accountNumber && (
                      <div><span style={{ fontSize: 11, color: "#64748b", display: "block" }}>{t("checkout.accountNumber", "Account Number")}</span><strong style={{ fontSize: 13, color: "#0f172a" }}>{currentMethod.accountNumber}</strong></div>
                    )}
                    {currentMethod.phoneNumber && (
                      <div><span style={{ fontSize: 11, color: "#64748b", display: "block" }}>{t("checkout.phoneNumber", "Phone Number")}</span><strong style={{ fontSize: 13, color: "#0f172a" }}>{currentMethod.phoneNumber}</strong></div>
                    )}
                    {currentMethod.bankName && (
                      <div><span style={{ fontSize: 11, color: "#64748b", display: "block" }}>{t("checkout.bank", "Bank")}</span><strong style={{ fontSize: 13, color: "#0f172a" }}>{currentMethod.bankName}</strong></div>
                    )}
                  </div>

                  {currentMethod.instructions && (
                    <div style={{ fontSize: 12, color: "#475569", background: "#f1f5f9", padding: "10px 12px", borderRadius: 6, marginBottom: 12, whiteSpace: "pre-line" }}>
                      {currentMethod.instructions}
                    </div>
                  )}

                  <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 12, marginTop: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                      {t("checkout.paymentProofOptional", "Payment Proof (Optional now, or submit on confirmation):")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                          {t("checkout.txRef", "Transaction ID / Reference Number (Optional)")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("checkout.txRefPlaceholder", "Enter your transaction reference / ID (optional)")}
                          value={txRef}
                          onChange={e => { setTxRef(e.target.value); setError(null); }}
                          style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                          {t("checkout.paymentScreenshot", "Receipt Screenshot")}
                        </label>
                        <div className="checkout-proof-upload-row">
                          <input
                            type="file"
                            accept="image/*"
                            id="checkoutProofFile"
                            style={{ display: "none" }}
                            onChange={e => setProofFile(e.target.files[0])}
                          />
                          <label htmlFor="checkoutProofFile" className="checkout-proof-file-label">
                            {proofFile ? `📎 ${proofFile.name}` : `📷 ${t("checkout.uploadReceipt", "Upload Receipt")}`}
                          </label>
                          <input
                            type="url"
                            placeholder={t("checkout.orPasteUrl", "Or paste screenshot image URL")}
                            value={receiptImageUrl}
                            onChange={e => setReceiptImageUrl(e.target.value)}
                            className="checkout-proof-url-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="checkout-section">
              <h2><span className="section-num">3</span> {t("checkout.stepCoupon", "Coupon Code")}</h2>
              {appliedCoupon ? (
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9 }}>
                  <span style={{ fontSize:18 }}>🎟️</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>{appliedCoupon.code}</div>
                    <div style={{ fontSize:13, color:"#64748b" }}>{t("checkout.couponSaved", "You save {{amount}}", { amount: fmt(discount) })}</div>
                  </div>
                  <button type="button" onClick={removeCoupon} style={{ background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
                </div>
              ) : (
                <div style={{ display:"flex", gap:10 }}>
                  <input
                    type="text"
                    placeholder={t("checkout.enterCouponPlaceholder", "Enter coupon code (e.g. SAVE20)")}
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex:1, padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none" }}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    style={{ padding:"10px 20px", background:"#2563eb", color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:14, cursor:"pointer", whiteSpace:"nowrap" }}
                  >
                    {couponLoading ? "..." : t("checkout.apply", "Apply")}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 16,
                  border: "1px solid #fecaca",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`checkout-button ${currentMethod?.code === "chapa" ? "chapa" : "cod"}`}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  {t("checkout.processingOrder", "Processing Order...")}
                </span>
              ) : currentMethod?.type === "chapa"
                ? t("checkout.payChapa", "Pay {{amount}} via Chapa 💳", { amount: fmt(finalTotal) })
                : currentMethod?.type === "cash_on_delivery" || selectedMethod === "cod"
                ? t("checkout.payCod", "Place Order — {{amount}} (Cash on Delivery) 🚚", { amount: fmt(finalTotal) })
                : t("checkout.payManual", "Place Order — {{amount}} ({{method}})", { amount: fmt(finalTotal), method: currentMethod?.name || "Manual Payment" })}
            </button>

          </form>

          {/* Order summary */}
          <div className="checkout-summary">
            <h2>{t("checkout.orderSummary", "Order Summary")}</h2>
            <div className="checkout-items">
              {cartItems.map(item => (
                <div className="checkout-item" key={item._id}>
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">× {item.quantity}</span>
                  </div>
                  <strong>{fmt(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-total-row"><span>{t("checkout.subtotal", "Subtotal")}</span><span>{fmt(cartTotal)}</span></div>
            <div className="checkout-total-row"><span>{t("checkout.shipping_free", "Shipping")}</span><span className="free-tag">{t("checkout.free", "Free")}</span></div>
            {discount > 0 && (
              <div className="checkout-total-row" style={{ color:"#16a34a" }}>
                <span>🎟️ {t("checkout.couponApplied", "Coupon ({{code}})", { code: appliedCoupon?.code })}</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            <div className="checkout-total-row grand"><span>{t("checkout.grandTotal", "Total")}</span><strong>{fmt(finalTotal)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
