import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import "./ProductList.css";
import { useWishlist } from "../context/WishlistContext";
function ProductList() {

    const [products, setProducts] = useState([]);

    const [searchParams] = useSearchParams();

    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const { addToCart } = useCart();
    const {
    toggleWishlist,
    isInWishlist
} = useWishlist();


    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await API.get("/products");

                setProducts(response.data.products || response.data);

            } catch (error) {

                console.log(error);

            }

        };

        fetchProducts();

    }, []);



    let filteredProducts = products;


    // Filter by category
    if (category) {

        filteredProducts = filteredProducts.filter(
            (product) =>
                product.category?.toLowerCase() === category.toLowerCase()
        );

    }


    // Filter by search
    if (search) {

        const keyword = search.toLowerCase();

        filteredProducts = filteredProducts.filter((product) =>

            product.name?.toLowerCase().includes(keyword) ||

            product.brand?.toLowerCase().includes(keyword) ||

            product.category?.toLowerCase().includes(keyword)

        );

    }



    return (

        <div className="product-list">

            <h2>

                {
                    category
                        ? `${category} Products`
                        : search
                        ? `Search Results for "${search}"`
                        : "All Products"
                }

            </h2>


            <div className="products-container">

                {

                    filteredProducts.length === 0 ? (

                        <p>No products found.</p>

                    ) : (

                        filteredProducts.map((product) => (

                            <Link
                                to={`/product/${product._id}`}
                                key={product._id}
                                className="product-link"
                            >

                                <div className="product-card">
                                    <button
    className={`wishlist-heart ${
        isInWishlist(product._id) ? "active" : ""
    }`}
    onClick={(e) => {

        e.preventDefault();

        toggleWishlist(product);

    }}
>
    {isInWishlist(product._id) ? "♥" : "♡"}
</button>

                                    {

                                        product.images &&
                                        product.images.length > 0 ? (

                                            <img
                                                src={`http://localhost:5000/${product.images[0]}`}
                                                alt={product.name}
                                                className="product-image"
                                            />

                                        ) : (

                                            <div className="no-image">

                                                No Image

                                            </div>

                                        )

                                    }

                                    <h3>{product.name}</h3>

                                    <p>

                                        <strong>Brand:</strong> {product.brand}

                                    </p>

                                    <p>

                                        <strong>Category:</strong> {product.category}

                                    </p>

                                    <p className="price">

                                        {product.price} ETB

                                    </p>

                                    <button
                                        className="cart-btn"
                                        onClick={(e) => {

                                            e.preventDefault();

                                            addToCart(product);

                                            alert(`${product.name} added to cart`);

                                        }}
                                    >

                                        Add To Cart

                                    </button>

                                </div>

                            </Link>

                        ))

                    )

                }

            </div>

        </div>

    );

}

export default ProductList;