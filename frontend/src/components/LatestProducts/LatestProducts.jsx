import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./LatestProducts.css";

// Show one product from each category
const FEATURED_CATEGORIES = [
  "Laptops",
  "Smartphones",
  "Gaming",
  "Network",
  "Smart Accessories",
  "Smart Watch",
  "Headphones & Audio",
  "Tablets",
  "Drones",
  "Printers & Scanners",
  "Smart Home",
  "Cameras",
];

function LatestProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await API.get("/products");
        const all = Array.isArray(res.data.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];

        // Pick one product per featured category
        const picked = [];
        const usedIds = new Set();

        for (const catName of FEATURED_CATEGORIES) {
          const match = all.find(
            (p) =>
              p.category?.toLowerCase() === catName.toLowerCase() &&
              !usedIds.has(p._id)
          );
          if (match) {
            picked.push(match);
            usedIds.add(match._id);
          }
        }

        // If some categories had no products, fill up to 12 from remaining
        if (picked.length < 12) {
          for (const p of all) {
            if (picked.length >= 12) break;
            if (!usedIds.has(p._id)) {
              picked.push(p);
              usedIds.add(p._id);
            }
          }
        }

        setProducts(picked);
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
          <div className="latest-header-left">
            <span className="latest-tag">NEW ARRIVALS</span>
            <h2>Latest Products</h2>
          </div>
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
          <span className="latest-tag">FEATURED</span>
          <h2>Latest Products</h2>
          <p>One pick from each category — discover what's new</p>
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

              {/* Stock badge */}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="lp-badge low">Low Stock</span>
              )}
              {product.stock === 0 && (
                <span className="lp-badge out">Out of Stock</span>
              )}

              {/* Image */}
              <Link to={`/product/${product._id}`} className="lp-img-link">
                {imgSrc ? (
                  <img src={imgSrc} alt={product.name} className="lp-img" loading="lazy" />
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
                  <span className="lp-price">
                    {Number(product.price).toLocaleString()} ETB
                  </span>
                  <button
                    className="lp-cart-btn"
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);
                      toast.success(`${product.name} added to cart`);
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

      {/* CTA */}
      <div className="latest-cta">
        <button className="latest-cta-btn" onClick={() => navigate("/products")}>
          Browse All Products
        </button>
      </div>

    </section>
  );
}

export default LatestProducts;
