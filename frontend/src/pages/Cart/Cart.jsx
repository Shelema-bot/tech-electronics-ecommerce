import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./Cart.css";


function Cart(){


    const {

        cartItems,

        increaseQuantity,

        decreaseQuantity,

        removeFromCart,

        cartTotal


    } = useCart();







    return(


        <div className="cart-page">


            <h1>

                Shopping Cart

            </h1>







            {

            cartItems.length === 0 ?



            (

                <div className="empty-cart">


                    <h2>

                        Your cart is empty

                    </h2>



                    <Link

                    to="/products"

                    className="continue-btn"

                    >

                        Continue Shopping

                    </Link>


                </div>


            )




            :



            (



            <>



                <div className="cart-list">





                {

                cartItems.map(item=>(



                    <div

                    className="cart-item"

                    key={item._id}

                    >






                        {

                        item.images &&

                        item.images.length > 0 ?



                        (

                            <img

                            src={

                            `http://localhost:5000/${

                            item.images[0].replace("\\","/")

                            }`

                            }

                            alt={item.name}

                            />

                        )



                        :



                        (

                            <div className="no-image">

                                No Image

                            </div>

                        )



                        }









                        <div className="cart-details">


                            <h3>

                                {item.name}

                            </h3>




                            <p>

                                Category:

                                {" "}

                                {item.category}

                            </p>





                            <p>

                                Price:

                                {" "}

                                {item.price} ETB

                            </p>


                        </div>











                        <div className="quantity-box">



                            <button

                            onClick={()=>decreaseQuantity(item._id)}

                            >

                                -

                            </button>





                            <span>

                                {item.quantity}

                            </span>






                            <button

                            onClick={()=>increaseQuantity(item._id)}

                            >

                                +

                            </button>



                        </div>











                        <div className="item-total">


                            <h3>


                            {

                            Number(item.price)

                            *

                            item.quantity


                            }


                            {" "}ETB



                            </h3>


                        </div>









                        <button

                        className="remove-btn"

                        onClick={()=>removeFromCart(item._id)}

                        >

                            Remove

                        </button>







                    </div>



                ))


                }




                </div>









                <div className="cart-summary">



                    <h2>


                        Total:

                        {" "}

                        {cartTotal}

                        {" "}ETB


                    </h2>






                    <div className="cart-actions">





                        <Link

                        to="/products"

                        className="continue-btn"

                        >

                            Continue Shopping

                        </Link>








                        <Link

                        to="/checkout"

                        className="checkout-btn"

                        >

                            Proceed To Checkout

                        </Link>





                    </div>




                </div>





            </>


            )


            }





        </div>


    );


}


export default Cart;