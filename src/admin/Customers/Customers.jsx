import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Customers.css";


function Customers(){


const [customers,setCustomers]=useState([]);

const [loading,setLoading]=useState(true);







useEffect(()=>{


fetchCustomers();


},[]);







const authConfig={


headers:{


Authorization:

`Bearer ${localStorage.getItem("token")}`


}


};









const fetchCustomers=async()=>{


try{


setLoading(true);



const response=await API.get(


"/admin/users",


authConfig


);




console.log(

"USERS:",

response.data

);




if(Array.isArray(response.data)){


setCustomers(response.data);


}

else if(Array.isArray(response.data.users)){


setCustomers(response.data.users);


}

else{


setCustomers([]);


}



}



catch(error){



console.log(

"CUSTOMER ERROR:",

error.response?.data || error.message

);



setCustomers([]);



}

finally{


setLoading(false);


}



};









const updateRole=async(id,role)=>{


try{


await API.put(


`/admin/users/${id}/role`,


{

role

},


authConfig


);



fetchCustomers();



}


catch(error){



console.log(

"ROLE UPDATE ERROR:",

error.response?.data || error.message

);



}



};









const updateStatus=async(id,status)=>{


try{


await API.put(


`/admin/users/${id}/status`,


{

isActive:status

},


authConfig


);



fetchCustomers();



}


catch(error){



console.log(

"STATUS UPDATE ERROR:",

error.response?.data || error.message

);



}



};









const deleteCustomer=async(id)=>{


if(!window.confirm(

"Delete this user?"

)) return;







try{


await API.delete(


`/admin/users/${id}`,


authConfig


);



alert(

"User deleted successfully"

);



fetchCustomers();



}



catch(error){



console.log(

"DELETE ERROR:",

error.response?.data || error.message

);



}



};









return(



<AdminLayout>



<div className="customers-page">





<h2>

Customers Management

</h2>









<table>


<thead>


<tr>


<th>

Name

</th>



<th>

Email

</th>



<th>

Phone

</th>



<th>

Address

</th>



<th>

Role

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

loading ?



(



<tr>

<td colSpan="7">

Loading...

</td>

</tr>



)



:



customers.length===0 ?



(



<tr>

<td colSpan="7">

No Customers Found

</td>

</tr>



)



:



customers.map(customer=>(



<tr key={customer._id}>




<td>

{customer.name}

</td>





<td>

{customer.email}

</td>





<td>

{customer.phone || "-"}

</td>





<td>

{customer.address || "-"}

</td>








<td>


<select


value={customer.role}


onChange={(e)=>

updateRole(

customer._id,

e.target.value

)

}


>



<option value="customer">

Customer

</option>



<option value="admin">

Admin

</option>



</select>



</td>








<td>



<button


className={

customer.isActive

?

"active-btn"

:

"inactive-btn"

}


onClick={()=>


updateStatus(

customer._id,

!customer.isActive

)


}


>


{

customer.isActive

?

"Active"

:

"Inactive"

}



</button>



</td>









<td>


<button


className="delete-btn"


onClick={()=>deleteCustomer(customer._id)}


>

Delete

</button>



</td>






</tr>



))



}





</tbody>





</table>







</div>



</AdminLayout>



);


}


export default Customers;