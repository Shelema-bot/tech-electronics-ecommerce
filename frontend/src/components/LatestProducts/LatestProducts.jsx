import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./LatestProducts.css";

function LatestProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await API.get("/products");
        const all = res.data.products || res.data;
        // Take latest 8 products
        setProducts(Array.isArray(all) ? all.slice(0, 8) : []);
      } catch (err) {
        console.log("Latest products error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <section className="latest-section">
        <div className="latest-header">
          <h2>Latest Products</h2>
        </div>
        <div className="latest-loading">
          <div className="loading-spinner" />
          <span>Loading products...</span>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="latest-section">

      {/* Header */}
      <div className="latest-header">
        <div className="latest-header-left">
          <span className="latest-tag">NEW ARRIVALS</span>
          <h2>Latest Products</h2>
          <p>Discover our newest tech gadgets and electronics</p>
        </div>
        <Link to="/products" className="latest-view-all">
          View All Products →
        </Link>
      </div>

      {/* Products grid */}
      <div className="latest-grid">
        {products.map((product) => {
          const imgSrc = getImageUrl(product.images?.[0]);
          const inWish = isInWishlist(product._id);

          return (
            <div className="lp-card" key={product._id}>

              {/* Wishlist */}
              <button
                className={`lp-wish ${inWish ? "active" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
              >
                {inWish ? "♥" : "♡"}
              </button>

              {/* Badge */}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="lp-badge low">Low Stock</span>
              )}
              {product.stock === 0 && (
                <span className="lp-badge out">Out of Stock</span>
              )}

              {/* Image */}
              <Link to={`/product/${product._id}`} className="lp-img-link">
                {imgSrc ? (
                  <img src={imgSrc} alt={product.name} className="lp-img" />
                ) : (
                  <div className="lp-no-img">📦</div>
                )}
              </Link>

              {/* Info */}
              <div className="lp-body">
                <p className="lp-category">{product.category}</p>
                <Link to={`/product/${product._id}`} className="lp-name-link">
                  <h3 className="lp-name">{product.name}</h3>
                </Link>
                <p className="lp-brand">{product.brand}</p>

                <div className="lp-footer">
                  <span className="lp-price">{product.price.toLocaleString()} ETB</span>
                  <button
                    className="lp-cart-btn"
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);
                      alert(`${product.name} added to cart`);
                    }}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="latest-cta">
        <button
          className="latest-cta-btn"
          onClick={() => navigate("/products")}
        >
          Browse All Products
        </button>
      </div>

    </section>
  );
}

export default LatestProducts;
