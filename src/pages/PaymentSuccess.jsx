import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "./PaymentSuccess.css";


function PaymentSuccess(){


const {clearCart}=useCart();


const [orderId,setOrderId]=useState("");

const [params]=useSearchParams();



useEffect(()=>{


const verifyPayment=async()=>{


const tx_ref =
params.get("tx_ref");



const pendingOrder =
localStorage.getItem("pendingOrder");



if(pendingOrder){

setOrderId(pendingOrder);

}



if(tx_ref){


try{


await API.get(

`/payments/verify?tx_ref=${tx_ref}`

);



localStorage.removeItem(
"pendingOrder"
);



clearCart();



}
catch(error){


console.log(
"VERIFY ERROR:",
error.response?.data || error.message
);


}



}



};



verifyPayment();



},[clearCart,params]);






return(


<div className="payment-success">


<h1>
Payment Successful 🎉
</h1>


<p>
Your order has been confirmed.
</p>



{

orderId &&

<p>

Order ID:

{" "}

<strong>

{orderId}

</strong>

</p>

}



<p>
Thank you for shopping with Tech & Electronic.
</p>



<Link
to="/my-orders"
className="continue-btn"
>

View My Orders

</Link>


<br/>


<Link
to="/products"
className="continue-btn"
>

Continue Shopping

</Link>


</div>


);


}


export default PaymentSuccess;