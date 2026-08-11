import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Settings.css";


function Settings(){


    const navigate = useNavigate();



    const [user,setUser] = useState({

        name:"",
        email:"",
        phone:"",
        address:"",
        profileImage:""

    });


    const [image,setImage] = useState(null);





    const getProfile = async()=>{


        try{


            const res =
            await API.get(
                "/users/admin/profile"
            );


            setUser(res.data.user);



        }
        catch(error){

            console.log(error);

        }


    };





    useEffect(()=>{


        getProfile();


    },[]);









    const handleChange=(e)=>{


        setUser({

            ...user,

            [e.target.name]:e.target.value

        });


    };








    const handleImage=(e)=>{


        setImage(
            e.target.files[0]
        );


    };









    const updateProfile = async(e)=>{


        e.preventDefault();



        try{


            const formData =
            new FormData();



            formData.append(
                "name",
                user.name
            );


            formData.append(
                "phone",
                user.phone
            );


            formData.append(
                "address",
                user.address
            );



            if(image){

                formData.append(
                    "profileImage",
                    image
                );

            }







            await API.put(

                "/users/admin/profile",

                formData,

                {

                    headers:{

                        "Content-Type":
                        "multipart/form-data"

                    }

                }

            );






            alert(
                "Profile Updated Successfully"
            );



            getProfile();



        }
        catch(error){


            console.log(error);


            alert(
                "Update Failed"
            );


        }


    };









    return(



        <div className="settings-admin">





            <button

            type="button"

            className="back-admin-btn"

            onClick={()=>navigate("/admin/dashboard")}

            >

                ← Back To Dashboard

            </button>







            <h1>

                Admin Settings

            </h1>







            <form onSubmit={updateProfile}>







            <div className="profile-image-box">





            {

            user.profileImage ?





            <img

            src={
            `http://localhost:5000/${user.profileImage.replace("\\","/")}`
            }

            alt="admin"

            />



            :



            <div className="no-image">

                Admin

            </div>


            }





            <input

            type="file"

            accept="image/*"

            onChange={handleImage}

            />



            </div>









                <label>

                    Name

                </label>





                <input

                name="name"

                value={user.name || ""}

                onChange={handleChange}

                />











                <label>

                    Email

                </label>





                <input

                value={user.email || ""}

                disabled

                />











                <label>

                    Phone

                </label>





                <input

                name="phone"

                value={user.phone || ""}

                onChange={handleChange}

                />











                <label>

                    Address

                </label>





                <textarea

                name="address"

                value={user.address || ""}

                onChange={handleChange}

                />












                <button>

                    Update Profile

                </button>





            </form>





        </div>



    );

}


export default Settings;