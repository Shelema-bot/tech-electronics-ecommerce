import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { getImageUrl } from "../../utils/imageUrl";
import "./AddCategory.css";


function EditCategory(){


const {id}=useParams();

const navigate=useNavigate();



const [name,setName]=useState("");

const [oldImage,setOldImage]=useState("");

const [image,setImage]=useState(null);

const [preview,setPreview]=useState("");

const [loading,setLoading]=useState(true);








useEffect(()=>{


const getCategory=async()=>{


try{


const res=await API.get(

`/categories/${id}`

);



const category=res.data.category || res.data;



setName(category.name);



setOldImage(

category.image

);



}


catch(error){


console.log(

"GET CATEGORY ERROR:",

error

);



}

finally{


setLoading(false);


}



};



getCategory();



},[id]);









const handleImage=(e)=>{


const file=e.target.files[0];


setImage(file);



if(file){


setPreview(

URL.createObjectURL(file)

);


}



};









const updateCategory=async(e)=>{


e.preventDefault();





if(!name.trim()){


alert(

"Category name is required"

);


return;


}







try{


setLoading(true);





const formData=new FormData();



formData.append(

"name",

name

);







if(image){


formData.append(

"image",

image

);


}








await API.put(


`/categories/${id}`,


formData,


{


headers:{


"Content-Type":

"multipart/form-data",


Authorization:

`Bearer ${localStorage.getItem("token")}`


}


}


);






alert(

"Category Updated Successfully"

);





navigate(

"/admin/categories"

);



}


catch(error){



console.log(

"UPDATE CATEGORY ERROR:",

error.response?.data || error.message

);



alert(

"Update Failed"

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

Loading category...

</h2>

</AdminLayout>

);


}








return(



<AdminLayout>



<div className="add-category">





<h1>

Edit Category

</h1>







<form onSubmit={updateCategory}>


<input


type="text"


value={name}


onChange={(e)=>

setName(e.target.value)

}


placeholder="Category Name"


/>









{

preview ?


<img


src={preview}


alt="new preview"


className="category-preview"


/>



:



oldImage &&


<img


src={getImageUrl(oldImage)}


alt={name}


className="category-preview"


/>



}










<input


type="file"


accept="image/*"


onChange={handleImage}


/>







<button

disabled={loading}

>



{

loading

?

"Updating..."

:

"Update Category"

}



</button>







</form>







</div>



</AdminLayout>



);


}



export default EditCategory;