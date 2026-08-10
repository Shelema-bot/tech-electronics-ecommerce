import { useState } from "react";
import "./Login.css";
import API from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";


function Login(){

    const navigate = useNavigate();


    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");




    const validateEmail = (email)=>{

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    };





    const handleLogin = async(e)=>{

        e.preventDefault();



        if(!validateEmail(email)){

            alert("Enter a valid email address");

            return;

        }



        if(password.length < 8){

            alert("Password must be at least 8 characters");

            return;

        }





        try{


            const response = await API.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );



            console.log(
                "LOGIN RESPONSE:",
                response.data
            );





            // Save token

            localStorage.setItem(
                "token",
                response.data.token
            );




            // Save user

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );





            // Update Navbar immediately

            window.dispatchEvent(
                new Event("loginStatusChanged")
            );




            alert("Login successful");






            // Redirect by role

            if(response.data.user.role === "admin"){


                navigate("/admin/dashboard");


            }
            else{


                navigate("/");


            }




        }
        catch(error){


            console.log(
                "LOGIN ERROR:",
                error.response?.data || error.message
            );


            alert(

                error.response?.data?.message ||

                "Login failed"

            );


        }


    };







    return(


        <div className="login-container">



            <form

                className="login-form"

                onSubmit={handleLogin}

            >



                <h2>
                    Login
                </h2>





                <input

                    type="email"

                    placeholder="Email address"

                    value={email}

                    onChange={(e)=>setEmail(e.target.value)}

                    required

                />





                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={(e)=>setPassword(e.target.value)}

                    required

                />





                <button type="submit">

                    Login

                </button>





                <p className="register-link">


                    Don't have an account?


                    <Link to="/register">

                        Register now

                    </Link>
                    <Link to="/forgot-password">
    Forgot Password?
</Link>



                </p>




            </form>




        </div>


    );

}



export default Login;