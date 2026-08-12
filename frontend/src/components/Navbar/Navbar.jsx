import React, { useEffect, useState } from "react";
import "./Navbar.css";

import { Link, useNavigate } from "react-router-dom";

import {
    FaShoppingCart,
    FaUserCircle,
    FaSearch,
    FaHeart
} from "react-icons/fa";
import logo from "../../assets/LOGO.jpg";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";


const Navbar = () => {


  const [user,setUser] = useState(null);

  const [search,setSearch] = useState("");

  const navigate = useNavigate();


  const { cartCount } = useCart();
  const { wishlist } = useWishlist();




  useEffect(()=>{


    const loadUser = ()=>{


      const savedUser =
      localStorage.getItem("user");


      if(savedUser){

        setUser(
          JSON.parse(savedUser)
        );

      }else{

        setUser(null);

      }


    };



    loadUser();



    window.addEventListener(
      "loginStatusChanged",
      loadUser
    );



    return()=>{

      window.removeEventListener(
        "loginStatusChanged",
        loadUser
      );

    };


  },[]);







  const logout = ()=>{


    localStorage.removeItem("token");

    localStorage.removeItem("user");


    setUser(null);


    window.dispatchEvent(
      new Event("loginStatusChanged")
    );


    navigate("/login");


  };








  const searchProduct = ()=>{


    if(search.trim()){


      navigate(
        `/products?search=${encodeURIComponent(search)}`
      );


    }


  };







return (


<nav className="navbar">


<div className="navbar-container">





{/* LOGO */}


<Link
to="/"
className="logo"
>


<img
src={logo}
alt="logo"
/>


<span>

Tech <b>&</b> Electronic

</span>


</Link>







{/* SEARCH */}



<div className="search-box">


<input

type="text"

placeholder="Search electronics..."

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

onKeyDown={(e)=>{

if(e.key==="Enter"){

searchProduct();

}

}}

/>


<FaSearch

onClick={searchProduct}

style={{
cursor:"pointer"
}}

/>


</div>







{/* LINKS */}



<ul className="nav-links">


<li>

<Link to="/">
Home
</Link>

</li>



<li>

<Link to="/products">
Products
</Link>

</li>



<li>

<Link to="/about">
About
</Link>

</li>
<li>

<Link to="/team">
Team
</Link>

</li>
<li>

<a href="#categories">
  Categories
</a>

</li>

<li>

<Link to="/Contact">
Contact page
</Link>

</li>



<li>

<Link to="/my-orders">
My Orders
</Link>

</li>


</ul>







{/* ICONS */}



<div className="nav-icons">






{/* CART */}



<Link

to="/cart"

className="icon cart-icon"

>


<FaShoppingCart/>


{

cartCount > 0 &&

<span className="cart-badge">

{cartCount}

</span>

}



<span>

Cart

</span>


</Link>

<Link
    to="/wishlist"
    className="icon wishlist-icon"
>

    <FaHeart />

    {
        wishlist.length > 0 && (
            <span className="wishlist-count">
                {wishlist.length}
            </span>
        )
    }

    Wishlist

</Link>






{/* ACCOUNT */}



{

user ?


<div className="account-area">



<Link

to="/profile"

className="icon"

>


{

user.profileImage ?


<img

src={
`http://localhost:5000/${user.profileImage}`
}

className="nav-profile-image"

alt="profile"

/>


:


<FaUserCircle/>


}



<span>

Account

</span>


</Link>






<button

className="logout-btn"

onClick={logout}

>

Logout

</button>



</div>




:



<Link

to="/login"

className="icon"

>


<FaUserCircle/>


<span>

Account

</span>


</Link>


}





</div>





</div>


</nav>


);


};


export default Navbar;