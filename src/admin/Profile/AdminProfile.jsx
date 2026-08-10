import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./AdminProfile.css";


function AdminProfile(){


    const [admin,setAdmin] = useState(null);



    useEffect(()=>{

        getAdminProfile();

    },[]);




    const getAdminProfile = async()=>{

        try{


            const res =
            await API.get("/users/admin/profile");


            setAdmin(res.data.user);


        }
        catch(error){

            console.log(error);

        }

    };




    if(!admin){

        return <h2>Loading...</h2>;

    }



    return(


        <div className="admin-profile">


            <h1>
                Admin Profile
            </h1>



            {

            admin.profileImage ?

            <img

            src={
            `http://localhost:5000/${admin.profileImage}`
            }

            className="admin-profile-image"

            alt="admin"

            />

            :

            <div className="admin-no-image">

                No Image

            </div>

            }



            <h2>
                {admin.name}
            </h2>



            <p>
                Email: {admin.email}
            </p>



            <p>
                Phone: {admin.phone}
            </p>



            <p>
                Address: {admin.address}
            </p>



            <span className="admin-role">

                ADMIN

            </span>



        </div>


    );

}


export default AdminProfile;