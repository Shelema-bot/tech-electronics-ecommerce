import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import API from "../../api/axios";
import "./Checkout.css";

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("chapa");

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Ethiopia",
  });

  const handleChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login before checkout");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.images?.[0],
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          country: shipping.country,
        },
        paymentMethod:
          paymentMethod === "chapa" ? "Chapa Payment" : "Cash on Delivery",
        itemsPrice: cartTotal,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: cartTotal,
      };

      // Create order
      const orderResponse = await API.post("/orders", orderData);
      const orderId =
        orderResponse.data.order?._id || orderResponse.data._id;

      if (!orderId) throw new Error("Order ID was not returned");

      // ── Cash on Delivery ─────────────────────────────
      if (paymentMethod === "cod") {
        clearCart();
        localStorage.removeItem("pendingOrder");
        alert("Order placed successfully! Pay on delivery.");
        navigate("/my-orders");
        return;
      }

      // ── Chapa Payment ────────────────────────────────
      localStorage.setItem("pendingOrder", orderId);

      const paymentResponse = await API.post("/payments/initialize", {
        orderId,
        amount: cartTotal,
      });

      const checkoutUrl = paymentResponse.data.checkout_url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("Payment link was not generated");
      }
    } catch (error) {
      console.log(
        "CHECKOUT ERROR:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>
          <h1>Your Cart is Empty</h1>
          <p>Add some products before proceeding to checkout.</p>
          <a href="/products">Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* Header */}
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your shipping information to continue</p>
        </div>

        <div className="checkout-grid">

          {/* Left — Form */}
          <form className="checkout-form" onSubmit={placeOrder}>

            {/* Shipping */}
            <div className="checkout-section">
              <h2>
                <span className="section-num">1</span>
                Shipping Information
              </h2>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={shipping.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 0912345678"
                  value={shipping.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street address"
                  value={shipping.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shipping.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={shipping.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={shipping.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>
                <span className="section-num">2</span>
                Payment Method
              </h2>

              <div className="payment-options">

                {/* Chapa */}
                <label
                  className={`payment-option ${paymentMethod === "chapa" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="chapa"
                    checked={paymentMethod === "chapa"}
                    onChange={() => setPaymentMethod("chapa")}
                  />
                  <div className="payment-option-icon">💳</div>
                  <div className="payment-option-info">
                    <strong>Chapa Online Payment</strong>
                    <span>Pay securely via Chapa — card, bank or mobile</span>
                  </div>
                  {paymentMethod === "chapa" && (
                    <span className="payment-check">✓</span>
                  )}
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div className="payment-option-icon">💵</div>
                  <div className="payment-option-info">
                    <strong>Cash on Delivery</strong>
                    <span>Pay in cash when your order arrives</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <span className="payment-check">✓</span>
                  )}
                </label>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`checkout-button ${paymentMethod}`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "chapa"
                ? `Pay ${cartTotal} ETB via Chapa`
                : `Place Order — ${cartTotal} ETB (Cash on Delivery)`}
            </button>

          </form>

          {/* Right — Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div className="checkout-item" key={item._id}>
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">× {item.quantity}</span>
                  </div>
                  <strong>{(item.price * item.quantity).toLocaleString()} ETB</strong>
                </div>
              ))}
            </div>

            <div className="checkout-total-row">
              <span>Subtotal</span>
              <span>{cartTotal.toLocaleString()} ETB</span>
            </div>
            <div className="checkout-total-row">
              <span>Shipping</span>
              <span className="free-tag">Free</span>
            </div>
            <div className="checkout-total-row grand">
              <span>Total</span>
              <strong>{cartTotal.toLocaleString()} ETB</strong>
            </div>

            {paymentMethod === "cod" && (
              <div className="cod-note">
                <span>🚚</span>
                <p>Your order will be delivered and you pay in cash on arrival.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
