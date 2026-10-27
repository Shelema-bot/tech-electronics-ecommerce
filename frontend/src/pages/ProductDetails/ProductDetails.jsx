import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import { usePreference } from "../../context/PreferenceContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const { fmt }  = usePreference();
  const { t }    = useTranslation();

  const [product, setProduct]                 = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [quantity, setQuantity]               = useState(1);
  const [selectedImage, setSelectedImage]     = useState(0);
  const [rating, setRating]                   = useState(5);
  const [comment, setComment]                 = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.log("PRODUCT ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const res = await API.get(`/products?category=${product.category}`);
        const all = res.data.products || res.data;
        setRelatedProducts(all.filter(p => p._id !== product._id).slice(0, 4));
      } catch (err) {
        console.log("RELATED ERROR:", err);
      }
    };
    fetchRelated();
  }, [product]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get(`/reviews/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.log("REVIEWS ERROR:", err);
      }
    };
    fetchReviews();
  }, [id]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((total, r) => total + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    } else {
      toast.warning(t("product.onlyItemsAvailable", `Only ${product.stock} items available`, { count: product.stock }));
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) { toast.error(t("product.outOfStock", "Product is out of stock")); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${quantity} × ${product.name} ${t("product.addedToCart", "added to cart")}`);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) { toast.error(t("product.outOfStock", "Product is out of stock")); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    navigate("/checkout");
  };

  const submitReview = async () => {
    if (!comment.trim()) { toast.warning(t("product.writeReview", "Please write a review comment")); return; }
    try {
      setSubmittingReview(true);
      const res = await API.post(`/reviews/${id}`, { rating, comment });
      setReviews(prev => [...prev, res.data]);
      setComment("");
      setRating(5);
      toast.success(t("product.reviewSubmitted", "Review submitted successfully!"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("product.reviewLoginRequired", "Please login to submit a review"));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="pd-spinner" />
        <h2>{t("product.loading", "Loading product...")}</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>{t("product.productNotFound", "Product not found")}</h2>
        <Link to="/products">{t("product.backToProducts", "Back to Products")}</Link>
      </div>
    );
  }

  const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  const discountPrice = product.discountPrice || product.price;
  const originalPrice = product.originalPrice || (product.discountPrice && product.price > product.discountPrice ? product.price : null);
  const hasDiscount = originalPrice && Number(originalPrice) > Number(discountPrice);

  return (
    <div className="product-details">

      <div className="product-main flex-col lg:flex-row">

        {/* Images */}
        <div className="product-images">
          <div className="main-image-container">
            {product.images?.length > 0 ? (
              <img
                src={getImageUrl(product.images[selectedImage])}
                alt={product.name}
                className="main-image"
              />
            ) : (
              <div className="no-image">{t("cart.noImage", "No Image")}</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnail-container">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  alt={`${product.name} ${i + 1}`}
                  className={`thumbnail ${selectedImage === i ? "active" : ""}`}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">

          <button
            type="button"
            className={`wishlist-btn ${isInWishlist(product._id) ? "active" : ""}`}
            onClick={() => {
              toggleWishlist(product);
              toast.info(isInWishlist(product._id) ? t("product.removeFromWishlist", "Removed from wishlist") : t("product.addToWishlist", "Added to wishlist"));
            }}
          >
            {isInWishlist(product._id) ? `♥ ${t("product.removeFromWishlist", "Remove from Wishlist")}` : `♡ ${t("product.addToWishlist", "Add to Wishlist")}`}
          </button>

          <h1>{product.name}</h1>

          <div className="product-rating">
            <span className="stars">{stars(averageRating)}</span>
            <span>{averageRating} ({reviews.length} {t("product.reviews", "reviews")})</span>
          </div>

          <p><strong>{t("product.brand", "Brand")}:</strong> {product.brand}</p>
          <p><strong>{t("product.category", "Category")}:</strong> {product.category}</p>

          <div className="product-description">
            <h3>{t("product.description", "Description")}</h3>
            <p>{product.description}</p>
          </div>

          <div className="flex items-center gap-3 my-3">
            <h2 className="product-price text-2xl font-bold text-blue-600">
              {fmt(discountPrice)}
            </h2>
            {hasDiscount && (
              <span className="text-lg line-through text-gray-400">
                {fmt(originalPrice)}
              </span>
            )}
          </div>

          <p className={`product-stock ${product.stock <= 0 ? "out" : product.stock <= 5 ? "low" : "in"}`}>
            <strong>{t("product.stock", "Stock")}:</strong>{" "}
            {product.stock <= 0
              ? t("product.outOfStock", "Out of Stock")
              : product.stock <= 5
              ? t("product.lowStock", "⚠ Only {{count}} left", { count: product.stock })
              : t("product.inStock", "✓ In Stock ({{count}})", { count: product.stock })}
          </p>

          {product.stock > 0 && (
            <div className="quantity-section">
              <button type="button" onClick={decreaseQuantity} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
            </div>
          )}

          <div className="product-actions">
            <button
              type="button"
              className="add-cart"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {product.stock > 0 ? t("product.addToCart", "Add To Cart") : t("product.soldOut", "Sold Out")}
            </button>
            <button
              type="button"
              className="buy-btn"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
            >
              {t("product.buyNow", "Buy Now")}
            </button>
          </div>

          <Link to="/products" className="back-btn">{t("product.continueShopping", "← Continue Shopping")}</Link>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>{t("product.relatedProducts", "Related Products")}</h2>
          <div className="related-products">
            {relatedProducts.map(item => (
              <div className="related-card" key={item._id}>
                <img
                  src={item.images?.[0] ? getImageUrl(item.images[0]) : ""}
                  alt={item.name}
                />
                <h3>{item.name}</h3>
                <p>{fmt(item.discountPrice || item.price)}</p>
                <Link to={`/product/${item._id}`} className="view-btn">{t("product.viewDetails", "View Details")}</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="reviews-section">
        <h2>{t("product.customerReviews", "Customer Reviews")}</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(review => (
              <div className="review-card" key={review._id}>
                <h3>{review.name}</h3>
                <div className="review-rating">{stars(review.rating)}</div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#64748b", marginBottom: "20px" }}>{t("product.noReviews", "No reviews yet. Be the first!")}</p>
        )}

        <div className="write-review">
          <h3>{t("product.writeReview", "Write a Review")}</h3>
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            <option value="5">⭐⭐⭐⭐⭐ — {t("product.excellent", "Excellent")}</option>
            <option value="4">⭐⭐⭐⭐ — {t("product.good", "Good")}</option>
            <option value="3">⭐⭐⭐ — {t("product.average", "Average")}</option>
            <option value="2">⭐⭐ — {t("product.poor", "Poor")}</option>
            <option value="1">⭐ — {t("product.terrible", "Terrible")}</option>
          </select>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={t("product.shareExperience", "Share your experience with this product...")}
          />
          <button type="button" onClick={submitReview} disabled={submittingReview}>
            {submittingReview ? t("product.submitting", "Submitting...") : t("product.submitReview", "Submit Review")}
          </button>
        </div>
      </section>

    </div>
  );
}

export default ProductDetails;
