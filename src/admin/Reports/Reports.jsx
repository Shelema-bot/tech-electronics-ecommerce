import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Reports.css";


function Reports(){


const [report,setReport]=useState({

    totalOrders:0,

    totalProducts:0,

    totalCustomers:0,

    totalRevenue:0,

    pendingPayments:0

});


const [loading,setLoading]=useState(true);







const authConfig={


headers:{


Authorization:

`Bearer ${localStorage.getItem("token")}`


}


};









useEffect(()=>{


getReports();


},[]);









const getReports=async()=>{


try{


setLoading(true);



const res=await API.get(


"/admin/reports",


authConfig


);



console.log(

"REPORT:",

res.data

);



setReport({

    totalOrders:res.data.totalOrders || 0,

    totalProducts:res.data.totalProducts || 0,

    totalCustomers:res.data.totalCustomers || 0,

    totalRevenue:res.data.totalRevenue || 0,

    pendingPayments:res.data.pendingPayments || 0

});



}



catch(error){



console.log(

"REPORT ERROR:",

error.response?.data || error.message

);



}



finally{


setLoading(false);


}



};









return(



<AdminLayout>



<div className="reports-admin">






<h1>

Sales Reports

</h1>







{

loading ?



<h2>

Loading Reports...

</h2>



:



<div className="reports-cards">





<div className="report-card">

<h3>

Total Orders

</h3>

<p>

{report.totalOrders}

</p>

</div>







<div className="report-card">

<h3>

Total Products

</h3>

<p>

{report.totalProducts}

</p>

</div>







<div className="report-card">

<h3>

Customers

</h3>

<p>

{report.totalCustomers}

</p>

</div>







<div className="report-card">

<h3>

Revenue

</h3>

<p>

{report.totalRevenue} ETB

</p>

</div>







<div className="report-card">

<h3>

Pending Payments

</h3>

<p>

{report.pendingPayments}

</p>

</div>







</div>



}





</div>



</AdminLayout>



);


}


export default Reports;