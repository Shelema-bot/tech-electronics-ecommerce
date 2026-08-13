import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import "./MyOrders.css";


function MyOrders(){


    const [orders,setOrders] = useState([]);

    const [loading,setLoading] = useState(true);





    useEffect(()=>{


        fetchOrders();


    },[]);









    const fetchOrders = async()=>{


        try{


            const token = localStorage.getItem("token");



            const response = await API.get(

                "/orders/myorders",

                {

                    headers:{


                        Authorization:
                        `Bearer ${token}`


                    }

                }

            );



            setOrders(

                response.data.orders || []

            );



        }


        catch(error){


            console.log(

                "MY ORDERS ERROR:",

                error.response?.data || error.message

            );


        }



        finally{


            setLoading(false);


        }


    };

const deleteOrder = async (orderId) => {

    const confirmed = window.confirm(
        "Are you sure you want to remove this order?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const token = localStorage.getItem("token");


        await API.delete(

            `/orders/${orderId}`,

            {

                headers: {

                    Authorization:
                    `Bearer ${token}`

                }

            }

        );


        // Refresh orders after deleting
        fetchOrders();


    }
    catch(error) {

        console.log(

            "DELETE ORDER ERROR:",

            error.response?.data ||
            error.message

        );


        alert(

            error.response?.data?.message ||
            "Failed to remove order"

        );

    }

};







    if(loading){


        return(

            <div className="loading-orders">

                Loading orders...

            </div>

        );


    }









    return(



        <div className="my-orders">






            <h1>

                My Orders

            </h1>








            {

            orders.length === 0 ?



            (


                <div className="empty-orders">


                    <h3>

                        No orders found

                    </h3>



                    <Link

                    to="/products"

                    className="continue-btn"

                    >

                        Start Shopping

                    </Link>



                </div>



            )



            :





            orders.map(order=>(



                <div

                className="order-card"

                key={order._id}

                >





                    <div className="order-header">


                        <h3>

                            Order ID

                        </h3>


                        <p>

                            {order._id}

                        </p>



                    </div>









                    <div className="order-info">



                        <p>

                            Date:

                            {" "}

                            {

                            new Date(

                                order.createdAt

                            ).toLocaleDateString()

                            }


                        </p>






                        <p>

                            Status:


                            <span

                            className={

                            `status ${

                            order.status?.toLowerCase()

                            }`

                            }

                            >

                                {

                                order.status || "Pending"

                                }


                            </span>


                        </p>







                        <p>

                            Payment:


                            {

                            order.isPaid ?



                            (

                            <span className="paid">

                                Paid ✓

                            </span>

                            )



                            :



                            (

                            <span className="pending">

                                Pending

                            </span>

                            )

                            }


                        </p>




                    </div>









                    <h3>

                        Products

                    </h3>







                    {

                    order.orderItems.map(item=>(




                        <div

                        className="order-product"

                        key={item.product}

                        >






                            {

                            item.image ?


                            <img

                            src={getImageUrl(item.image)}

                            alt={item.name}

                            />



                            :


                            null


                            }








                            <div>


                                <strong>

                                    {item.name}

                                </strong>


                                <p>

                                    Quantity:

                                    {" "}

                                    {item.quantity}

                                </p>



                            </div>







                            <span>

                                {

                                item.quantity *

                                item.price

                                }

                                {" "}ETB

                            </span>





                        </div>





                    ))

                    }









                    <h2>

                        Total:

                        {" "}

                        {order.totalPrice}

                        {" "}ETB


                    </h2>
                    <button
    className="remove-order-btn"
    onClick={() => deleteOrder(order._id)}
>
    Remove Order
</button>






                </div>



            ))


            }





        </div>



    );


}



export default MyOrders;