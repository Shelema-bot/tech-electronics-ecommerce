import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import API from "../../api/axios";

import {
FaHome,
FaBox,
FaList,
FaShoppingCart,
FaUsers,
FaCreditCard,
FaChartBar,
FaCog,
FaSignOutAlt
} from "react-icons/fa";

import "./Sidebar.css";



function Sidebar({collapsed}){


const location=useLocation();

const navigate=useNavigate();


const [admin,setAdmin]=useState(null);





useEffect(()=>{


getAdminProfile();


},[]);







const getAdminProfile=async()=>{


try{


const res=await API.get(

"/users/admin/profile"

);



setAdmin(

res.data.user

);



}

catch(error){


console.log(

"Admin Profile Error:",

error.response?.data || error.message

);


}


};









const logout=()=>{


localStorage.removeItem("token");

localStorage.removeItem("user");



window.dispatchEvent(

new Event("loginStatusChanged")

);



navigate("/login");


};









const menuItems=[


{
path:"/admin",
name:"Dashboard",
icon:<FaHome/>
},


{
path:"/admin/products",
name:"Products",
icon:<FaBox/>
},


{
path:"/admin/categories",
name:"Categories",
icon:<FaList/>
},


{
path:"/admin/orders",
name:"Orders",
icon:<FaShoppingCart/>
},


{
path:"/admin/customers",
name:"Customers",
icon:<FaUsers/>
},


{
path:"/admin/payments",
name:"Payments",
icon:<FaCreditCard/>
},


{
path:"/admin/reports",
name:"Reports",
icon:<FaChartBar/>
},


{
path:"/admin/settings",
name:"Settings",
icon:<FaCog/>
}


];









return(


<div


className={

collapsed

?

"sidebar collapsed"

:

"sidebar"

}


>





<h2 className="logo">

Tech Admin

</h2>









<Link

to="/admin/profile"

className="sidebar-profile"

>



{

admin?.profileImage ?



<img

src={

`http://localhost:5000/${

admin.profileImage.replaceAll("\\","/")

}`

}

alt="admin"

/>



:



<div className="sidebar-no-image">


{

admin?.name

?

admin.name.charAt(0).toUpperCase()

:

"A"

}


</div>



}




<span>


{

admin?.name || "Admin"

}


</span>



</Link>









<ul>



{

menuItems.map(item=>(


<li key={item.path}>


<Link

to={item.path}

className={

location.pathname===item.path

?

"active"

:

""

}


>


{item.icon}



<span>

{item.name}

</span>


</Link>




</li>



))


}

<Link
    to="/admin/contacts"
    className="sidebar-link"
>
    <span className="sidebar-icon">✉</span>

    {!collapsed && (
        <span>
            Contact Messages
        </span>
    )}
</Link>



<li className="logout">


<button

onClick={logout}

>


<FaSignOutAlt/>


<span>

Logout

</span>


</button>


</li>





</ul>






</div>



);


}


export default Sidebar;