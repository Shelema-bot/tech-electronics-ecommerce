import { useEffect, useState } from "react";
import "./Products.css";

import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { Link } from "react-router-dom";


function Products(){


const [products,setProducts]=useState([]);

const [search,setSearch]=useState("");

const [categoryFilter,setCategoryFilter]=useState("All");

const [currentPage,setCurrentPage]=useState(1);

const [stockValues,setStockValues]=useState({});

const [loading,setLoading]=useState(true);



const productsPerPage=5;





useEffect(()=>{


fetchProducts();


},[]);






const authConfig={

headers:{

Authorization:`Bearer ${localStorage.getItem("token")}`

}

};









const fetchProducts=async()=>{


try{


const res=await API.get("/products");


setProducts(

res.data.products || res.data

);



}

catch(error){


console.log(error);


}

finally{


setLoading(false);


}


};









const deleteProduct=async(id)=>{



const confirmDelete=window.confirm(

"Delete this product?"

);



if(!confirmDelete)return;






try{



await API.delete(

`/products/${id}`,

authConfig

);





fetchProducts();



alert(

"Product deleted successfully"

);



}

catch(error){



console.log(error);



alert(

"Delete failed"

);


}



};









const updateStock=async(id)=>{


if(stockValues[id] === ""){


alert("Enter stock value");

return;


}





try{


await API.put(


`/products/${id}`,


{

stock:Number(stockValues[id])

},


authConfig



);




fetchProducts();



alert(

"Stock updated successfully"

);



}

catch(error){



console.log(error);



alert(

"Stock update failed"

);



}



};









const categories=[


"All",


...new Set(

products.map(

product=>product.category

)

)


];









const filteredProducts=products.filter(product=>{


const matchSearch=


product.name

.toLowerCase()

.includes(

search.toLowerCase()

);





const matchCategory=


categoryFilter==="All"

||

product.category===categoryFilter;



return matchSearch && matchCategory;



});









const totalPages=Math.ceil(

filteredProducts.length/productsPerPage

);





const currentProducts=filteredProducts.slice(


(currentPage-1)*productsPerPage,


currentPage*productsPerPage


);








if(loading){


return(

<AdminLayout>

<h2>

Loading products...

</h2>

</AdminLayout>

);


}








return(



<AdminLayout>


<div className="products-admin">





<div className="products-header">


<h1>

Products Management

</h1>







<div className="products-actions">





<input


type="text"


placeholder="Search products..."


className="search-box"


value={search}


onChange={(e)=>{


setSearch(e.target.value);

setCurrentPage(1);


}}


/>








<select


className="category-filter"


value={categoryFilter}


onChange={(e)=>{


setCategoryFilter(e.target.value);

setCurrentPage(1);


}}



>



{

categories.map(category=>(


<option

key={category}

value={category}

>

{category}

</option>



))


}



</select>








<Link

to="/admin/add-product"

className="add-btn"

>

+ Add Product

</Link>





</div>


</div>









<table>


<thead>


<tr>

<th>Image</th>

<th>Name</th>

<th>Category</th>

<th>Price</th>

<th>Stock</th>

<th>Status</th>

<th>Actions</th>


</tr>


</thead>








<tbody>


{


currentProducts.length===0 ?



<tr>

<td colSpan="7">

No Products Found

</td>

</tr>





:


currentProducts.map(product=>(



<tr key={product._id}>


<td>



{

product.images?.length>0 ?


<img

src={`http://localhost:5000/${product.images[0]}`}

className="product-thumb"

alt={product.name}

/>



:


"No Image"



}


</td>





<td>

{product.name}

</td>





<td>

{product.category}

</td>





<td>

{product.price} ETB

</td>








<td>


<input


type="number"


className="stock-input"


value={

stockValues[product._id] ?? product.stock

}


onChange={(e)=>

setStockValues({

...stockValues,

[product._id]:e.target.value

})


}



/>




<button

className="stock-update-btn"

onClick={()=>updateStock(product._id)}

>

Save

</button>



</td>








<td>


{

product.stock===0 ?


<span className="stock out">

Out Of Stock

</span>



:


product.stock<=5 ?


<span className="stock low">

Low Stock

</span>



:


<span className="stock good">

In Stock

</span>


}



</td>








<td>


<Link

to={`/admin/edit-product/${product._id}`}

className="edit"

>

Edit

</Link>







<button

className="delete"

onClick={()=>deleteProduct(product._id)}

>

Delete

</button>



</td>





</tr>



))


}



</tbody>





</table>








<div className="pagination">





<button

disabled={currentPage===1}

onClick={()=>setCurrentPage(currentPage-1)}

>

Previous

</button>







{

[...Array(totalPages)].map((_,index)=>(


<button

key={index}

className={

currentPage===index+1

?

"active-page"

:

""

}


onClick={()=>setCurrentPage(index+1)}

>

{index+1}

</button>



))


}








<button

disabled={currentPage===totalPages}

onClick={()=>setCurrentPage(currentPage+1)}

>

Next

</button>





</div>







</div>


</AdminLayout>


);


}


export default Products;