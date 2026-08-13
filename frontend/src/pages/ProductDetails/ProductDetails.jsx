import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./ProductDetails.css";

function ProductDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { addToCart } = useCart();

    // Wishlist
    const {
        isInWishlist,
        toggleWishlist
    } = useWishlist();


    // ==============================
    // Get Product
    // ==============================

    useEffect(() => {

        const fetchProduct = async () => {

            try {

                const response =
                    await API.get(`/products/${id}`);

                const data = response.data.product || response.data;
                setProduct(data);

            } catch (error) {

                console.log(
                    "PRODUCT ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        fetchProduct();

    }, [id]);


    // ==============================
    // Get Related Products
    // ==============================

    useEffect(() => {

        const fetchRelated = async () => {

            if (!product) return;

            try {

                const response = await API.get(
                    `/products?category=${product.category}`
                );

                const filtered =
                    response.data.filter(
                        (item) =>
                            item._id !== product._id
                    );

                setRelatedProducts(
                    filtered.slice(0, 4)
                );

            } catch (error) {

                console.log(
                    "RELATED PRODUCTS ERROR:",
                    error
                );

            }

        };

        fetchRelated();

    }, [product]);


    // ==============================
    // Get Reviews
    // ==============================

    useEffect(() => {

        const fetchReviews = async () => {

            try {

                const response =
                    await API.get(`/reviews/${id}`);

                setReviews(response.data);

            } catch (error) {

                console.log(
                    "REVIEWS ERROR:",
                    error
                );

            }

        };

        fetchReviews();

    }, [id]);


    // ==============================
    // Average Rating
    // ==============================

    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce(
                    (total, review) =>
                        total + review.rating,
                    0
                ) / reviews.length
            ).toFixed(1)
            : 0;


    // ==============================
    // Quantity
    // ==============================

    const increaseQuantity = () => {

        if (quantity < product.stock) {

            setQuantity(quantity + 1);

        } else {

            alert(
                `Only ${product.stock} items available`
            );

        }

    };


    const decreaseQuantity = () => {

        if (quantity > 1) {

            setQuantity(quantity - 1);

        }

    };


    // ==============================
    // Add To Cart
    // ==============================

    const handleAddToCart = () => {

        if (product.stock <= 0) {

            alert("Product is out of stock");

            return;

        }

        for (
            let i = 0;
            i < quantity;
            i++
        ) {

            addToCart(product);

        }

        alert(
            `${quantity} ${product.name} added to cart`
        );

    };
    // ==============================
// Buy Now
// ==============================

const handleBuyNow = () => {

    if (product.stock <= 0) {

        alert("Product is out of stock");

        return;

    }

    // Add selected quantity to cart
    for (
        let i = 0;
        i < quantity;
        i++
    ) {

        addToCart(product);

    }

    // Go directly to checkout
    navigate("/checkout");

};


    // ==============================
    // Wishlist
    // ==============================

    const handleWishlist = () => {

        toggleWishlist(product);

    };


    // ==============================
    // Submit Review
    // ==============================

    const submitReview = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await API.post(
                `/reviews/${id}`,
                {
                    rating,
                    comment
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setReviews([
                ...reviews,
                response.data
            ]);

            setComment("");

            alert(
                "Review added successfully"
            );

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Please login first"
            );

        }

    };


    // ==============================
    // Loading
    // ==============================

    if (loading) {

        return (

            <div className="product-loading">

                <h2>
                    Loading product...
                </h2>

            </div>

        );

    }


    // ==============================
    // Product Not Found
    // ==============================

    if (!product) {

        return (

            <div className="product-not-found">

                <h2>
                    Product not found
                </h2>

                <Link to="/products">
                    Back to Products
                </Link>

            </div>

        );

    }


    return (

        <div className="product-details">


            {/* =========================
                Product Section
            ========================== */}

            <div className="product-main">


                {/* Product Images */}

                <div className="product-images">

                    <div className="main-image-container">

                        {product.images &&
                        product.images.length > 0 ? (

                            <img
                                src={
                                    `${getImageUrl(product.images[selectedImage])}`
                                }
                                alt={product.name}
                                className="main-image"
                            />

                        ) : (

                            <div className="no-image">
                                No Image
                            </div>

                        )}

                    </div>


                    {/* Thumbnails */}

                    {product.images &&
                    product.images.length > 0 && (

                        <div className="thumbnail-container">

                            {product.images.map(
                                (image, index) => (

                                    <img
                                        key={index}
                                        src={
                                            `${getImageUrl(image)}`
                                        }
                                        alt={`${product.name} ${index + 1}`}
                                        className={
                                            selectedImage === index
                                                ? "thumbnail active"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(index)
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* Product Information */}

                <div className="product-info">


                    {/* Wishlist Button */}

                    <button
                        type="button"
                        className={
                            isInWishlist(product._id)
                                ? "wishlist-btn active"
                                : "wishlist-btn"
                        }
                        onClick={handleWishlist}
                    >

                        {isInWishlist(product._id)
                            ? "♥ Remove from Wishlist"
                            : "♡ Add to Wishlist"}

                    </button>


                    <h1>
                        {product.name}
                    </h1>


                    {/* Rating */}

                    <div className="product-rating">

                        <span className="stars">

                            {"★".repeat(
                                Math.round(
                                    averageRating
                                )
                            )}

                            {"☆".repeat(
                                5 -
                                Math.round(
                                    averageRating
                                )
                            )}

                        </span>

                        <span>
                            {averageRating} (
                            {reviews.length} reviews)
                        </span>

                    </div>


                    {/* Brand */}

                    <p>

                        <strong>
                            Brand:
                        </strong>{" "}

                        {product.brand}

                    </p>


                    {/* Category */}

                    <p>

                        <strong>
                            Category:
                        </strong>{" "}

                        {product.category}

                    </p>


                    {/* Description */}

                    <div className="product-description">

                        <h3>
                            Description
                        </h3>

                        <p>
                            {product.description}
                        </p>

                    </div>


                    {/* Price */}

                    <h2 className="product-price">

                        {product.price} ETB

                    </h2>


                    {/* Stock */}

                    <p className="product-stock">

                        <strong>
                            Stock:
                        </strong>{" "}

                        {product.stock > 0
                            ? `In Stock (${product.stock})`
                            : "Out Of Stock"}

                    </p>


                    {/* Quantity */}

                    <div className="quantity-section">

                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={
                                product.stock <= 0
                            }
                        >
                            -
                        </button>

                        <span>
                            {quantity}
                        </span>

                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={
                                product.stock <= 0
                            }
                        >
                            +
                        </button>

                    </div>


                    {/* Actions */}

                    <div className="product-actions">

                        <button
                            type="button"
                            className="add-cart"
                            disabled={
                                product.stock <= 0
                            }
                            onClick={
                                handleAddToCart
                            }
                        >

                            {product.stock > 0
                                ? "Add To Cart"
                                : "Out Of Stock"}

                        </button>


                        <button
    type="button"
    className="buy-btn"
    disabled={
        product.stock <= 0
    }
    onClick={
        handleBuyNow
    }
>

    Buy Now

</button>

                    </div>


                    {/* Continue Shopping */}

                    <Link
                        to="/products"
                        className="back-btn"
                    >

                        Continue Shopping

                    </Link>

                </div>

            </div>


            {/* =========================
                Related Products
            ========================== */}

            <section className="related-section">

                <h2>
                    Related Products
                </h2>


                {relatedProducts.length > 0 ? (

                    <div className="related-products">

                        {relatedProducts.map(
                            (item) => (

                                <div
                                    className="related-card"
                                    key={item._id}
                                >

                                    <img
                                        src={
                                            item.images &&
                                            item.images.length > 0
                                        ? `${getImageUrl(item.images[0])}`
                                                : "/no-image.png"
                                        }
                                        alt={item.name}
                                    />

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        {item.price} ETB
                                    </p>

                                    <Link
                                        to={`/product/${item._id}`}
                                        className="view-btn"
                                    >

                                        View Details

                                    </Link>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <p>
                        No related products found
                    </p>

                )}

            </section>


            {/* =========================
                Reviews
            ========================== */}

            <section className="reviews-section">

                <h2>
                    Customer Reviews
                </h2>


                {reviews.length > 0 ? (

                    <div className="reviews-list">

                        {reviews.map(
                            (review) => (

                                <div
                                    className="review-card"
                                    key={review._id}
                                >

                                    <h3>
                                        {review.name}
                                    </h3>

                                    <div className="review-rating">

                                        {"★".repeat(
                                            review.rating
                                        )}

                                        {"☆".repeat(
                                            5 -
                                            review.rating
                                        )}

                                    </div>

                                    <p>
                                        {review.comment}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <p>
                        No reviews yet
                    </p>

                )}


                {/* Write Review */}

                <div className="write-review">

                    <h3>
                        Write a Review
                    </h3>

                    <select
                        value={rating}
                        onChange={(e) =>
                            setRating(
                                Number(e.target.value)
                            )
                        }
                    >

                        <option value="5">
                            ⭐⭐⭐⭐⭐
                        </option>

                        <option value="4">
                            ⭐⭐⭐⭐
                        </option>

                        <option value="3">
                            ⭐⭐⭐
                        </option>

                        <option value="2">
                            ⭐⭐
                        </option>

                        <option value="1">
                            ⭐
                        </option>

                    </select>


                    <textarea
                        value={comment}
                        onChange={(e) =>
                            setComment(
                                e.target.value
                            )
                        }
                        placeholder="Write your review..."
                    />


                    <button
                        type="button"
                        onClick={submitReview}
                    >

                        Submit Review

                    </button>

                </div>

            </section>

        </div>

    );

}

export default ProductDetails;
