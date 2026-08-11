import { useState } from "react";
import { useCart } from "../../context/CartContext";
import API from "../../api/axios";
import "./Checkout.css";

function Checkout() {

    const {
        cartItems,
        cartTotal,
        clearCart
    } = useCart();

    const [loading, setLoading] = useState(false);

    const [shipping, setShipping] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        country: "Ethiopia"
    });


    // ==============================
    // Handle Input Changes
    // ==============================

    const handleChange = (e) => {

        setShipping({
            ...shipping,
            [e.target.name]: e.target.value
        });

    };


    // ==============================
    // Place Order
    // ==============================

    const placeOrder = async (e) => {

        e.preventDefault();


        // Check cart
        if (cartItems.length === 0) {

            alert("Your cart is empty");

            return;

        }


        // Check login
        const token = localStorage.getItem("token");

        if (!token) {

            alert("Please login before checkout");

            return;

        }


        try {

            setLoading(true);


            // ==============================
            // Create Order Data
            // ==============================

            const orderData = {

                orderItems: cartItems.map(
                    (item) => ({

                        product: item._id,

                        name: item.name,

                        image: item.images?.[0],

                        price: item.price,

                        quantity: item.quantity

                    })
                ),


                shippingAddress: {

                    fullName: shipping.fullName,

                    phone: shipping.phone,

                    address: shipping.address,

                    city: shipping.city,

                    postalCode: shipping.postalCode,

                    country: shipping.country

                },


                paymentMethod: "Chapa Payment",

                itemsPrice: cartTotal,

                shippingPrice: 0,

                taxPrice: 0,

                totalPrice: cartTotal

            };


            // ==============================
            // Create Order
            // ==============================

            const orderResponse = await API.post(

                "/orders",

                orderData,

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            console.log(
                "ORDER CREATED:",
                orderResponse.data
            );


            const orderId =
                orderResponse.data.order?._id ||
                orderResponse.data._id;


            if (!orderId) {

                throw new Error(
                    "Order ID was not returned"
                );

            }


            // Save pending order
            localStorage.setItem(
                "pendingOrder",
                orderId
            );


            // ==============================
            // Initialize Chapa Payment
            // ==============================

            const paymentResponse =
                await API.post(

                    "/payments/initialize",

                    {
                        orderId,
                        amount: cartTotal
                    },

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        }

                    }

                );


            console.log(
                "PAYMENT RESPONSE:",
                paymentResponse.data
            );


            const checkoutUrl =
                paymentResponse.data.checkout_url;


            // ==============================
            // Redirect To Chapa
            // ==============================

            if (checkoutUrl) {

                window.location.href =
                    checkoutUrl;

            } else {

                alert(
                    "Payment link was not generated"
                );

            }


        } catch (error) {

            console.log(
                "CHECKOUT ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Checkout failed"
            );


        } finally {

            setLoading(false);

        }

    };


    // ==============================
    // Empty Cart
    // ==============================

    if (cartItems.length === 0) {

        return (

            <div className="checkout-page">

                <div className="checkout-empty">

                    <h1>
                        Your Cart is Empty
                    </h1>

                    <p>
                        Add some products before
                        proceeding to checkout.
                    </p>

                    <a href="/products">
                        Continue Shopping
                    </a>

                </div>

            </div>

        );

    }


    return (

        <div className="checkout-page">

            <div className="checkout-container">


                {/* =================================
                    Checkout Header
                ================================== */}

                <div className="checkout-header">

                    <h1>
                        Checkout
                    </h1>

                    <p>
                        Complete your shipping
                        information to continue.
                    </p>

                </div>


                {/* =================================
                    Order Summary
                ================================== */}

                <div className="checkout-summary">

                    <h2>
                        Order Summary
                    </h2>


                    <div className="checkout-items">

                        {cartItems.map(
                            (item) => (

                                <div
                                    className="checkout-item"
                                    key={item._id}
                                >

                                    <div>

                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            Quantity:
                                            {" "}
                                            {item.quantity}
                                        </p>

                                    </div>


                                    <strong>

                                        {
                                            item.price *
                                            item.quantity
                                        }

                                        {" "}ETB

                                    </strong>

                                </div>

                            )
                        )}

                    </div>


                    <div className="checkout-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            {cartTotal} ETB
                        </strong>

                    </div>

                </div>


                {/* =================================
                    Shipping Information
                ================================== */}

                <form
                    className="checkout-form"
                    onSubmit={placeOrder}
                >

                    <h2>
                        Shipping Information
                    </h2>


                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

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

                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={shipping.phone}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Address
                        </label>

                        <input
                            type="text"
                            name="address"
                            placeholder="Enter your address"
                            value={shipping.address}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                City
                            </label>

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

                            <label>
                                Postal Code
                            </label>

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

                        <label>
                            Country
                        </label>

                        <input
                            type="text"
                            name="country"
                            value={shipping.country}
                            onChange={handleChange}
                        />

                    </div>


                    {/* =================================
                        Payment
                    ================================== */}

                    <div className="payment-method">

                        <h3>
                            Payment Method
                        </h3>

                        <div className="payment-option">

                            <span className="payment-icon">
                                💳
                            </span>

                            <div>

                                <strong>
                                    Chapa Payment
                                </strong>

                                <p>
                                    Secure online payment
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        Submit
                    ================================== */}

                    <button
                        type="submit"
                        className="checkout-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Processing Payment..."
                            : `Pay ${cartTotal} ETB`}

                    </button>


                </form>

            </div>

        </div>

    );

}

export default Checkout;