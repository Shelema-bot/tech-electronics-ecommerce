import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference } from "../../context/PreferenceContext";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { fmt } = usePreference();
  const { t }   = useTranslation();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>{t("account.myWishlist", "My Wishlist")}</h1>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">♡</div>
            <h2>{t("account.emptyWishlist", "Your wishlist is empty")}</h2>
            <p>{t("account.emptyWishlistDesc", "Save products you love and find them here later.")}</p>
            <Link to="/products" className="wishlist-shop-btn">
              {t("product.browseProducts", "Browse Products")}
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div className="wishlist-card" key={product._id}>
                {/* Product Image */}
                <Link to={`/product/${product._id}`} className="wishlist-product-link">
                  <div className="wishlist-image">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                      />
                    ) : (
                      <div className="no-image">{t("cart.noImage", "No Image")}</div>
                    )}
                  </div>
                </Link>

                {/* Product Information */}
                <div className="wishlist-info">
                  <Link to={`/product/${product._id}`} className="wishlist-title-link">
                    <h3>{product.name}</h3>
                  </Link>

                  <p className="wishlist-brand">
                    <strong>{t("product.brand", "Brand")}:</strong> {product.brand}
                  </p>

                  <p className="wishlist-category">
                    <strong>{t("product.category", "Category")}:</strong> {product.category}
                  </p>

                  <p className="wishlist-price">
                    {fmt(product.discountPrice || product.price)}
                  </p>

                  <div className="wishlist-actions">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="wishlist-cart-btn"
                    >
                      {t("product.addToCart", "Add to Cart")}
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="wishlist-remove-btn"
                    >
                      {t("common.remove", "Remove")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
