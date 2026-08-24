import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import API from "../../api/axios";
import "./Checkout.css";

const METHOD_ICONS = {
  chapa:            "💳",
  cod:              "💵",
  cash_on_delivery: "💵",
  telebirr:         "📱",
  cbe:              "🏦",
  boa:              "🏛️",
};

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const toast    = useToast();

  const [loading, setLoading]           = useState(false);
  const [methods, setMethods]           = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount]       = useState(0);
  const finalTotal = cartTotal - discount;

  // Manual payment proof state
  const [proofStep, setProofStep]       = useState(false);
  const [paymentId, setPaymentId]       = useState(null);
  const [methodInfo, setMethodInfo]     = useState(null);
  const [txRef, setTxRef]               = useState("");
  const [proofFile, setProofFile]       = useState(null);
  const [note, setNote]                 = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [orderAmount, setOrderAmount]   = useState(cartTotal);

  const [shipping, setShipping] = useState({
    fullName: "", phone: "", address: "", city: "", postalCode: "", country: "Ethiopia",
  });

  // Load payment methods from backend
  useEffect(() => {
    API.get("/payment-methods")
      .then(res => {
        const ms = res.data.methods || [];
        setMethods(ms);
        if (ms.length > 0) setSelectedMethod(ms[0].code);
      })
      .catch(() => {
        // Fallback to defaults if backend unavailable
        const fallback = [
          { _id:"chapa",  code:"chapa",  name:"Chapa Payment",    type:"chapa",            enabled:true, requiresScreenshot:false, requiresReference:false },
          { _id:"cod",    code:"cod",    name:"Cash on Delivery",  type:"cash_on_delivery", enabled:true, requiresScreenshot:false, requiresReference:false },
        ];
        setMethods(fallback);
        setSelectedMethod("chapa");
      })
      .finally(() => setMethodsLoading(false));
  }, []);

  const handleChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.warning("Enter a coupon code"); return; }
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

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { toast.warning("Your cart is empty"); return; }
    if (!localStorage.getItem("token")) { toast.warning("Please login before checkout"); navigate("/login"); return; }
    if (!selectedMethod) { toast.warning("Please select a payment method"); return; }

    try {
      setLoading(true);

      // Create order
      const orderRes = await API.post("/orders", {
        orderItems: cartItems.map(item => ({
          product: item._id, name: item.name, image: item.images?.[0],
          price: item.price, quantity: item.quantity,
        })),
        shippingAddress: { ...shipping },
        paymentMethod: currentMethod?.name || selectedMethod,
        itemsPrice: cartTotal, shippingPrice: 0, taxPrice: 0, totalPrice: cartTotal,
      });

      const orderId = orderRes.data.order?._id || orderRes.data._id;
      if (!orderId) throw new Error("Order ID was not returned");

      setOrderAmount(cartTotal);

      // Create payment
      const payRes = await API.post("/payments", { orderId, methodCode: selectedMethod });

      if (payRes.data.type === "chapa") {
        // Redirect to Chapa
        localStorage.setItem("pendingOrder", orderId);
        clearCart();
        window.location.href = payRes.data.checkout_url;
        return;
      }

      if (payRes.data.type === "cash_on_delivery") {
        clearCart();
        navigate(`/payment-result?type=cod&orderId=${orderId}`);
        return;
      }

      if (payRes.data.type === "manual") {
        // Show proof submission step
        setPaymentId(payRes.data.paymentId);
        setMethodInfo(payRes.data.method);
        clearCart();
        setProofStep(true);
        return;
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Checkout failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (currentMethod?.requiresReference && !txRef.trim()) {
      toast.warning("Transaction reference is required"); return;
    }
    if (currentMethod?.requiresScreenshot && !proofFile) {
      toast.warning("Payment screenshot is required"); return;
    }

    try {
      setSubmittingProof(true);
      const fd = new FormData();
      fd.append("transactionReference", txRef);
      fd.append("customerNote", note);
      if (proofFile) fd.append("paymentProof", proofFile);

      await API.post(`/payments/${paymentId}/proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/payment-result?type=manual&paymentId=${paymentId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Proof submission failed");
    } finally {
      setSubmittingProof(false);
    }
  };

  // ── Manual proof submission step ────────────────────────────────────────────
  if (proofStep && methodInfo) {
    return (
      <div className="checkout-page">
        <div className="checkout-container" style={{ maxWidth: 640 }}>
          <div className="checkout-header">
            <h1>Complete Your Payment</h1>
            <p>Follow the instructions below and submit your payment proof</p>
          </div>

          {/* Payment instructions */}
          <div className="payment-instruction-card">
            <div className="pic-header">
              <span className="pic-icon">{METHOD_ICONS[selectedMethod] || "💳"}</span>
              <div>
                <h2>Pay with {methodInfo.name}</h2>
                <div className="pic-amount">Amount: <strong>{Number(orderAmount).toLocaleString()} ETB</strong></div>
              </div>
            </div>

            <div className="pic-details">
              {methodInfo.accountName   && <div className="pic-row"><span>Account Name</span><strong>{methodInfo.accountName}</strong></div>}
              {methodInfo.accountNumber && <div className="pic-row"><span>Account Number</span><strong>{methodInfo.accountNumber}</strong></div>}
              {methodInfo.phoneNumber   && <div className="pic-row"><span>Phone Number</span><strong>{methodInfo.phoneNumber}</strong></div>}
              {methodInfo.bankName      && <div className="pic-row"><span>Bank</span><strong>{methodInfo.bankName}</strong></div>}
            </div>

            {methodInfo.instructions && (
              <div className="pic-instructions">
                <h4>Instructions</h4>
                <pre>{methodInfo.instructions}</pre>
              </div>
            )}

            {methodInfo.qrCode && (
              <div className="pic-qr">
                <img src={methodInfo.qrCode} alt="Payment QR Code" />
              </div>
            )}
          </div>

          {/* Proof submission form */}
          <form className="proof-form" onSubmit={submitProof}>
            <h3>Submit Payment Proof</h3>

            {methodInfo.requiresReference && (
              <div className="form-group">
                <label>Transaction / Reference Number *</label>
                <input
                  type="text"
                  placeholder="Enter your transaction reference number"
                  value={txRef}
                  onChange={e => setTxRef(e.target.value)}
                  required
                />
              </div>
            )}

            {methodInfo.requiresScreenshot && (
              <div className="form-group">
                <label>Payment Screenshot *</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={e => setProofFile(e.target.files[0])}
                    id="proofFile"
                    style={{ display: "none" }}
                    required
                  />
                  <label htmlFor="proofFile" className="file-upload-btn">
                    {proofFile ? `📎 ${proofFile.name}` : "📷 Choose Screenshot"}
                  </label>
                  {proofFile && (
                    <img
                      src={URL.createObjectURL(proofFile)}
                      alt="preview"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginTop: 8, border: "1px solid #e2e8f0" }}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Note (optional)</label>
              <textarea
                placeholder="Any additional notes for the admin..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows="2"
              />
            </div>

            <button type="submit" className="checkout-button chapa" disabled={submittingProof}>
              {submittingProof ? "Submitting..." : "Submit Payment Proof"}
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
          <h1>Your Cart is Empty</h1>
          <p>Add some products before proceeding to checkout.</p>
          <Link to="/products">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // ── Main checkout ────────────────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your shipping information to continue</p>
        </div>

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={placeOrder}>

            {/* Shipping */}
            <div className="checkout-section">
              <h2><span className="section-num">1</span> Shipping Information</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" placeholder="Enter your full name" value={shipping.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" placeholder="e.g. 0912345678" value={shipping.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" placeholder="Street address" value={shipping.address} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input name="postalCode" placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <input name="country" value={shipping.country} onChange={handleChange} />
              </div>
            </div>

            {/* Payment Method — loaded from backend */}
            <div className="checkout-section">
              <h2><span className="section-num">2</span> Payment Method</h2>
              {methodsLoading ? (
                <div style={{ color: "#64748b", padding: "16px 0" }}>Loading payment methods...</div>
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
                  <p>Your order will be delivered and you pay in cash on arrival.</p>
                </div>
              )}

              {/* Manual method note */}
              {currentMethod?.type === "manual" && (
                <div className="cod-note" style={{ background:"#eff6ff", borderColor:"#bfdbfe" }}>
                  <span>ℹ️</span>
                  <p>After placing your order you'll receive the payment account details and can upload your payment proof. Your order will be confirmed after admin verification.</p>
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="checkout-section">
              <h2><span className="section-num">3</span> Coupon Code</h2>
              {appliedCoupon ? (
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9 }}>
                  <span style={{ fontSize:18 }}>🎟️</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>{appliedCoupon.code}</div>
                    <div style={{ fontSize:13, color:"#64748b" }}>You save {discount.toLocaleString()} ETB</div>
                  </div>
                  <button type="button" onClick={removeCoupon} style={{ background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:16 }}>✕</button>
                </div>
              ) : (
                <div style={{ display:"flex", gap:10 }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. SAVE20)"
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
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className={`checkout-button ${currentMethod?.code === "chapa" ? "chapa" : "cod"}`} disabled={loading}>
              {loading ? "Processing..." : currentMethod?.type === "chapa"
                ? `Pay ${finalTotal.toLocaleString()} ETB via Chapa`
                : currentMethod?.type === "cash_on_delivery"
                ? `Place Order — ${finalTotal.toLocaleString()} ETB (Cash on Delivery)`
                : `Place Order — ${finalTotal.toLocaleString()} ETB (${currentMethod?.name || "Manual Payment"})`}
            </button>
          </form>

          {/* Order summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cartItems.map(item => (
                <div className="checkout-item" key={item._id}>
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">× {item.quantity}</span>
                  </div>
                  <strong>{(item.price * item.quantity).toLocaleString()} ETB</strong>
                </div>
              ))}
            </div>
            <div className="checkout-total-row"><span>Subtotal</span><span>{cartTotal.toLocaleString()} ETB</span></div>
            <div className="checkout-total-row"><span>Shipping</span><span className="free-tag">Free</span></div>
            {discount > 0 && (
              <div className="checkout-total-row" style={{ color:"#16a34a" }}>
                <span>🎟️ Coupon ({appliedCoupon?.code})</span>
                <span>-{discount.toLocaleString()} ETB</span>
              </div>
            )}
            <div className="checkout-total-row grand"><span>Total</span><strong>{finalTotal.toLocaleString()} ETB</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
