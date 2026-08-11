import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./AddCategory.css";


function AddCategory(){


const navigate=useNavigate();



const [name,setName]=useState("");

const [image,setImage]=useState(null);

const [loading,setLoading]=useState(false);









const submitCategory=async(e)=>{


e.preventDefault();





if(!name.trim()){


alert("Category name is required");


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








await API.post(


"/categories",


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

"Category Added Successfully"

);






navigate("/admin/categories");





}


catch(error){



console.log(

"ADD CATEGORY ERROR:",

error.response?.data || error.message

);




alert(

"Failed to add category"

);



}


finally{


setLoading(false);


}



};









return(



<AdminLayout>



<div className="add-category">





<h1>

Add Category

</h1>







<form onSubmit={submitCategory}>







<input


type="text"


placeholder="Category Name"


value={name}


onChange={(e)=>

setName(e.target.value)

}


/>









<input


type="file"


accept="image/*"


onChange={(e)=>

setImage(e.target.files[0])

}


/>










<button

type="submit"

disabled={loading}

>



{

loading

?

"Adding..."

:

"Add Category"

}



</button>








</form>








</div>



</AdminLayout>



);


}



export default AddCategory;