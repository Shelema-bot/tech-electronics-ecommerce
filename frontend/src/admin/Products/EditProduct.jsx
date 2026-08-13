import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { getImageUrl } from "../../utils/imageUrl";
import "./AddProduct.css";


function EditProduct(){


const {id}=useParams();

const navigate=useNavigate();



const [images,setImages]=useState([]);


const [preview,setPreview]=useState([]);


const [loading,setLoading]=useState(true);




const [product,setProduct]=useState({

name:"",
category:"",
brand:"",
description:"",
price:"",
stock:""

});








useEffect(()=>{


const getProduct=async()=>{


try{


const res=await API.get(

`/products/${id}`

);



const data=res.data.product || res.data;



setProduct({

name:data.name,

category:data.category,

brand:data.brand,

description:data.description,

price:data.price,

stock:data.stock

});





if(data.images){


setPreview(data.images);


}



}


catch(error){


console.log(error);


}


finally{


setLoading(false);


}


};



getProduct();



},[id]);









const handleChange=(e)=>{


setProduct({

...product,

[e.target.name]:e.target.value

});


};








const handleImage=(e)=>{


const files=[...e.target.files];


setImages(files);



setPreview(

files.map(file=>

URL.createObjectURL(file)

)

);



};









const updateProduct=async(e)=>{


e.preventDefault();




try{


const formData=new FormData();




Object.keys(product).forEach(key=>{


formData.append(

key,

product[key]

);


});







images.forEach(image=>{


formData.append(

"images",

image

);


});







await API.put(


`/products/${id}`,


formData,


{


headers:{


"Content-Type":"multipart/form-data",


Authorization:

`Bearer ${localStorage.getItem("token")}`



}


}


);






alert(

"Product Updated Successfully"

);



navigate("/admin/products");



}



catch(error){



console.log(

"UPDATE ERROR:",

error.response?.data || error.message

);



alert(

"Update failed"

);


}



};








if(loading){


return <h2>Loading product...</h2>;


}








return(


<AdminLayout>


<div className="add-product">





<h1>

Edit Product

</h1>







<form onSubmit={updateProduct}>




<input

name="name"

value={product.name}

onChange={handleChange}

required

/>







<input

name="category"

value={product.category}

onChange={handleChange}

required

/>








<input

name="brand"

value={product.brand}

onChange={handleChange}

/>








<textarea

name="description"

value={product.description}

onChange={handleChange}

/>








<input

type="number"

name="price"

value={product.price}

onChange={handleChange}

required

/>








<input

type="number"

name="stock"

value={product.stock}

onChange={handleChange}

required

/>









<input

type="file"

multiple

onChange={handleImage}

/>







<div className="image-preview">


{

preview.map((img,index)=>(


<img

key={index}

src={

img.startsWith("blob")

?

img

:

getImageUrl(img)

}

alt="preview"

/>



))


}



</div>









<button type="submit">


Update Product


</button>






</form>







</div>


</AdminLayout>


);


}



export default EditProduct;