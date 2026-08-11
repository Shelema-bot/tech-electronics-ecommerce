import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import "./Wishlist.css";


function Wishlist() {

    const {
        wishlist,
        removeFromWishlist
    } = useWishlist();

    const { addToCart } = useCart();


    const handleAddToCart = (product) => {

        addToCart(product);

        removeFromWishlist(product._id);

    };


    return (

        <div className="wishlist-page">

            <div className="wishlist-container">

                <h1>My Wishlist</h1>


                {wishlist.length === 0 ? (

                    <div className="empty-wishlist">

                        <div className="empty-icon">
                            ♡
                        </div>

                        <h2>Your wishlist is empty</h2>

                        <p>
                            Save products you love and find them here later.
                        </p>

                        <Link
                            to="/products"
                            className="wishlist-shop-btn"
                        >
                            Browse Products
                        </Link>

                    </div>

                ) : (

                    <div className="wishlist-grid">

                        {wishlist.map((product) => (

                            <div
                                className="wishlist-card"
                                key={product._id}
                            >

                                {/* Product Image */}

                                <Link
                                    to={`/product/${product._id}`}
                                    className="wishlist-product-link"
                                >

                                    <div className="wishlist-image">

                                        {product.images &&
                                        product.images.length > 0 ? (

                                            <img
                                                src={`http://localhost:5000/${product.images[0]}`}
                                                alt={product.name}
                                            />

                                        ) : (

                                            <div className="no-image">
                                                No Image
                                            </div>

                                        )}

                                    </div>

                                </Link>


                                {/* Product Information */}

                                <div className="wishlist-info">

                                    <Link
                                        to={`/product/${product._id}`}
                                        className="wishlist-title-link"
                                    >

                                        <h3>
                                            {product.name}
                                        </h3>

                                    </Link>


                                    <p className="wishlist-brand">

                                        <strong>
                                            Brand:
                                        </strong>{" "}

                                        {product.brand}

                                    </p>


                                    <p className="wishlist-category">

                                        <strong>
                                            Category:
                                        </strong>{" "}

                                        {product.category}

                                    </p>


                                    <p className="wishlist-price">

                                        {product.price} ETB

                                    </p>


                                    <div className="wishlist-actions">

                                        <button
                                            onClick={() =>
                                                handleAddToCart(product)
                                            }
                                            className="wishlist-cart-btn"
                                        >
                                            Add to Cart
                                        </button>


                                        <button
                                            onClick={() =>
                                                removeFromWishlist(
                                                    product._id
                                                )
                                            }
                                            className="wishlist-remove-btn"
                                        >
                                            Remove
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