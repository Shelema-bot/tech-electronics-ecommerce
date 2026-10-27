import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { getImageUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import { usePreference } from "../../context/PreferenceContext";
import "./Cart.css";

function Cart() {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal } = useCart();
  const toast = useToast();
  const { fmt } = usePreference();
  const { t } = useTranslation();

  const handleRemove = (item) => {
    removeFromCart(item._id);
    toast.info(t("cart.itemRemoved", "{{name}} removed from cart", { name: item.name }));
  };

  return (
    <div className="cart-page">
      <h1>{t("cart.shoppingCart", "Shopping Cart")}</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>{t("cart.yourCartIsEmpty", "Your cart is empty")}</h2>
          <Link to="/products" className="continue-btn">
            {t("cart.continueShopping", "Continue Shopping")}
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item._id}>
                {item.images && item.images.length > 0 ? (
                  <img
                    src={getImageUrl(item.images[0])}
                    alt={item.name}
                  />
                ) : (
                  <div className="no-image">
                    {t("cart.noImage", "No Image")}
                  </div>
                )}

                <div className="cart-details">
                  <h3>{item.name}</h3>
                  <p>
                    {t("cart.category", "Category")}: {item.category}
                  </p>
                  <p>
                    {t("cart.price", "Price")}: {fmt(item.price)}
                  </p>
                </div>

                <div className="quantity-box">
                  <button onClick={() => decreaseQuantity(item._id)} aria-label="Decrease quantity">
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item._id)} aria-label="Increase quantity">
                    +
                  </button>
                </div>

                <div className="item-total">
                  <h3>{fmt(Number(item.price) * item.quantity)}</h3>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item)}
                >
                  {t("cart.remove", "Remove")}
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>{t("cart.total", "Total")}: {fmt(cartTotal)}</h2>

            <div className="cart-actions">
              <Link to="/products" className="continue-btn">
                {t("cart.continueShopping", "Continue Shopping")}
              </Link>
              <Link to="/checkout" className="checkout-btn">
                {t("cart.proceedToCheckout", "Proceed To Checkout")}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
