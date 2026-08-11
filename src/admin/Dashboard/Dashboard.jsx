import { useEffect, useState } from "react";
import API from "../../api/axios";

import "./Dashboard.css";

import AdminLayout from "../components/AdminLayout";
import DashboardCard from "../components/DashboardCard";

import SalesChart from "../components/Charts/SalesChart";
import OrdersChart from "../components/Charts/OrdersChart";
import CategoryChart from "../components/Charts/CategoryChart";
import "../components/Charts/Charts.css";


function Dashboard(){


const [loading,setLoading]=useState(true);



const [report,setReport]=useState({


totalProducts:0,

totalOrders:0,

totalCustomers:0,

totalRevenue:0,

pendingPayments:0,


productsByCategory:[],

monthlySales:[],

ordersByStatus:[]


});







useEffect(()=>{


fetchDashboardData();


},[]);









const fetchDashboardData=async()=>{


try{


const token=localStorage.getItem("token");



const res=await API.get(


"/admin/reports",


{


headers:{


Authorization:`Bearer ${token}`


}


}


);




setReport(res.data);



}


catch(error){



console.log(

"Dashboard Error:",

error.response?.data || error.message

);



}


finally{


setLoading(false);


}



};









if(loading){


return(

<AdminLayout>

<h2>

Loading Dashboard...

</h2>

</AdminLayout>

);


}







return(



<AdminLayout>





<h1 className="dashboard-title">

Dashboard

</h1>









<div className="dashboard-cards">



<DashboardCard

title="Products"

value={report.totalProducts}

color="#2563eb"

/>





<DashboardCard

title="Orders"

value={report.totalOrders}

color="#f59e0b"

/>





<DashboardCard

title="Customers"

value={report.totalCustomers}

color="#ef4444"

/>





<DashboardCard

title="Revenue"

value={`${report.totalRevenue} ETB`}

color="#10b981"

/>






<DashboardCard

title="Pending Payments"

value={report.pendingPayments}

color="#8b5cf6"

/>





</div>









<div className="charts-grid">





<div className="chart-box">


<h2>

Monthly Sales

</h2>


<SalesChart

data={report.monthlySales || []}

/>


</div>








<div className="chart-box">


<h2>

Orders Status

</h2>


<OrdersChart

data={report.ordersByStatus || []}

/>


</div>








<div className="chart-box">


<h2>

Products By Category

</h2>


<CategoryChart

data={report.productsByCategory || []}

/>


</div>





</div>









<div className="dashboard-welcome">


<h2>

Welcome Admin 👋

</h2>



<p>

Manage products, categories, customers,
orders, payments, reports and monitor
your business performance in real time.

</p>



</div>







</AdminLayout>



);


}



export default Dashboard;