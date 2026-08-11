import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Orders.css";


function Orders(){


const [orders,setOrders]=useState([]);

const [loading,setLoading]=useState(true);






useEffect(()=>{


fetchOrders();


},[]);







const fetchOrders=async()=>{


try{


const token=localStorage.getItem("token");



const response=await API.get(

"/admin/orders",

{

headers:{

Authorization:`Bearer ${token}`

}

}

);



console.log(

"ADMIN ORDERS RESPONSE:",

response.data

);




setOrders(

response.data.orders || response.data

);



}

catch(error){


console.log(

"ORDER ERROR:",

error.response?.data || error.message

);



}

finally{


setLoading(false);


}


};









const updateStatus=async(id,status)=>{


try{


const token=localStorage.getItem("token");



await API.put(


`/admin/orders/${id}/status`,


{

status

},


{

headers:{

Authorization:`Bearer ${token}`

}

}


);





fetchOrders();



}

catch(error){



console.log(

"UPDATE STATUS ERROR:",

error.response?.data || error.message

);



}



};









if(loading){


return(

<AdminLayout>

<h2>

Loading orders...

</h2>

</AdminLayout>

);


}

const deleteOrder = async (id) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this order?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const token = localStorage.getItem("token");


        await API.delete(

            `/admin/orders/${id}`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );


        // Refresh orders after deletion
        fetchOrders();


    }
    catch(error) {

        console.log(
            "DELETE ORDER ERROR:",
            error.response?.data || error.message
        );

        alert(
            error.response?.data?.message ||
            "Failed to delete order"
        );

    }

};






return(



<AdminLayout>


<div className="admin-orders">





<h1>

Orders Management

</h1>








<table>


<thead>


<tr>


<th>

Customer

</th>



<th>

Products

</th>



<th>

Payment

</th>



<th>

Status

</th>



<th>

Action

</th>


</tr>



</thead>








<tbody>





{

orders.length===0 ?



(



<tr>

<td colSpan="5">

No Orders Found

</td>

</tr>



)



:



(



orders.map(order=>(



<tr key={order._id}>






<td>


{

order.user ?


<>


{order.user.name}

<br/>

{order.user.email}

</>



:


"Guest User"


}


</td>








<td>



{


order.orderItems?.map((item,index)=>(



<div key={index}>


{item.name}

{" x "}

{item.quantity}



</div>



))


}



</td>








<td>


{

order.isPaid ?



<span className="paid">

Paid ✓

</span>



:



<span className="pending">

Pending

</span>



}



</td>








<td>


<span className={

order.status?.toLowerCase()

}>


{order.status || "Pending"}


</span>



</td>









<td>


<select


value={order.status || "Pending"}


onChange={(e)=>

updateStatus(

order._id,

e.target.value

)

}



>



<option value="Pending">

Pending

</option>



<option value="Processing">

Processing

</option>



<option value="Delivered">

Delivered

</option>



</select>

<button
    className="delete-order-btn"
    onClick={() => deleteOrder(order._id)}
>
    Delete
</button>

</td>






</tr>



))


)



}



</tbody>





</table>






</div>


</AdminLayout>



);


}


export default Orders;