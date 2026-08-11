import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./Profile.css";


function Profile(){

    const [user,setUser] = useState(null);

    const [image,setImage] = useState(null);

    const [preview,setPreview] = useState("");

    const [form,setForm] = useState({
        name:"",
        phone:"",
        address:""
    });



    useEffect(()=>{

        getProfile();

    },[]);




    const getProfile = async()=>{

        try{

            const res = await API.get("/users/profile");


            setUser(res.data.user);


            setForm({

                name:res.data.user.name || "",

                phone:res.data.user.phone || "",

                address:res.data.user.address || ""

            });



        }catch(error){

            console.log(error);

        }

    };






    const handleChange=(e)=>{


        setForm({

            ...form,

            [e.target.name]:e.target.value

        });


    };







    const handleImage=(e)=>{


        const file=e.target.files[0];


        if(file){

            setImage(file);


            setPreview(
                URL.createObjectURL(file)
            );

        }


    };







    const updateProfile=async(e)=>{


        e.preventDefault();



        try{


            const formData=new FormData();


            formData.append(
                "name",
                form.name
            );


            formData.append(
                "phone",
                form.phone
            );


            formData.append(
                "address",
                form.address
            );



            if(image){

                formData.append(
                    "profileImage",
                    image
                );

            }





            const res = await API.put(

                "/users/profile",

                formData,

                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }

            );



            setUser(res.data.user);


            alert(
                "Profile updated successfully"
            );



        }catch(error){


            console.log(
                error.response?.data || error.message
            );


        }


    };






    if(!user){

        return <h2>Loading...</h2>;

    }






return(

<div className="profile">


<h1>
My Profile
</h1>





<img

src={

preview

?

preview

:

user.profileImage

?

`http://localhost:5000/${user.profileImage}`

:

"/default-user.png"

}

className="profile-image"

alt="profile"

/>





<input

type="file"

accept="image/*"

onChange={handleImage}

/>







<form onSubmit={updateProfile}>


<input

type="text"

name="name"

value={form.name}

onChange={handleChange}

placeholder="Name"

/>




<input

type="text"

name="phone"

value={form.phone}

onChange={handleChange}

placeholder="Phone"

/>




<textarea

name="address"

value={form.address}

onChange={handleChange}

placeholder="Address"

/>





<button type="submit">

Update Profile

</button>



</form>





</div>


);


}


export default Profile;