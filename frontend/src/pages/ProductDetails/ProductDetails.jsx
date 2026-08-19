import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
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
    ? (reviews.reduce((t, r) => t + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    } else {
      toast.warning(`Only ${product.stock} items available`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) { toast.error("Product is out of stock"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) { toast.error("Product is out of stock"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    navigate("/checkout");
  };

  const submitReview = async () => {
    if (!comment.trim()) { toast.warning("Please write a review comment"); return; }
    try {
      setSubmittingReview(true);
      const res = await API.post(`/reviews/${id}`, { rating, comment });
      setReviews(prev => [...prev, res.data]);
      setComment("");
      setRating(5);
      toast.success("Review submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Please login to submit a review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="pd-spinner" />
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  return (
    <div className="product-details">

      <div className="product-main">

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
              <div className="no-image">No Image</div>
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
              toast.info(isInWishlist(product._id) ? "Removed from wishlist" : "Added to wishlist");
            }}
          >
            {isInWishlist(product._id) ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
          </button>

          <h1>{product.name}</h1>

          <div className="product-rating">
            <span className="stars">{stars(averageRating)}</span>
            <span>{averageRating} ({reviews.length} reviews)</span>
          </div>

          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Category:</strong> {product.category}</p>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <h2 className="product-price">
            {Number(product.price).toLocaleString()} ETB
          </h2>

          <p className={`product-stock ${product.stock <= 0 ? "out" : product.stock <= 5 ? "low" : "in"}`}>
            <strong>Stock:</strong>{" "}
            {product.stock <= 0
              ? "Out of Stock"
              : product.stock <= 5
              ? `⚠ Only ${product.stock} left`
              : `✓ In Stock (${product.stock})`}
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
              {product.stock > 0 ? "Add To Cart" : "Out Of Stock"}
            </button>
            <button
              type="button"
              className="buy-btn"
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          <Link to="/products" className="back-btn">← Continue Shopping</Link>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>Related Products</h2>
          <div className="related-products">
            {relatedProducts.map(item => (
              <div className="related-card" key={item._id}>
                <img
                  src={item.images?.[0] ? getImageUrl(item.images[0]) : ""}
                  alt={item.name}
                />
                <h3>{item.name}</h3>
                <p>{Number(item.price).toLocaleString()} ETB</p>
                <Link to={`/product/${item._id}`} className="view-btn">View Details</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="reviews-section">
        <h2>Customer Reviews</h2>
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
          <p style={{ color: "#64748b", marginBottom: "20px" }}>No reviews yet. Be the first!</p>
        )}

        <div className="write-review">
          <h3>Write a Review</h3>
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            <option value="5">⭐⭐⭐⭐⭐ — Excellent</option>
            <option value="4">⭐⭐⭐⭐ — Good</option>
            <option value="3">⭐⭐⭐ — Average</option>
            <option value="2">⭐⭐ — Poor</option>
            <option value="1">⭐ — Terrible</option>
          </select>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
          />
          <button type="button" onClick={submitReview} disabled={submittingReview}>
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </section>

    </div>
  );
}

export default ProductDetails;
