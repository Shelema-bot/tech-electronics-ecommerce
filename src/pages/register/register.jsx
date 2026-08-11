import { useState } from "react";
import "./Register.css";
import API from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";


function Register(){

    const navigate = useNavigate();


    const [formData,setFormData] = useState({

        name:"",
        email:"",
        phone:"",
        password:"",
        confirmPassword:""

    });



    const handleChange = (e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };



    const validateEmail = (email)=>{

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    };



    const validatePhone = (phone)=>{

        return /^09\d{8}$/.test(phone);

    };



    const validatePassword = (password)=>{

        return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    };



    const handleRegister = async(e)=>{

        e.preventDefault();



        if(formData.name.length < 9 || formData.name.length > 25){

            alert("Name must be between 9 and 25 characters");

            return;

        }



        if(!validateEmail(formData.email)){

            alert("Enter a valid email address");

            return;

        }



        if(!validatePhone(formData.phone)){

            alert("Phone must be Ethiopian format: 0912345678");

            return;

        }



        if(!validatePassword(formData.password)){

            alert(
                "Password must contain at least 8 characters, one uppercase letter and one number"
            );

            return;

        }



        if(formData.password !== formData.confirmPassword){

            alert("Passwords do not match");

            return;

        }



        try{


            await API.post("/auth/register",{

                name:formData.name,

                email:formData.email,

                phone:formData.phone,

                password:formData.password

            });



            alert("Account created successfully");


            navigate("/login");



        }catch(error){


            console.log(error);


            alert(

                error.response?.data?.message ||

                "Registration failed"

            );


        }


    };



    return(


        <div className="register-container">


            <form

                className="register-form"

                onSubmit={handleRegister}

            >


                <h2>
                    Create Account
                </h2>



                <input

                    type="text"

                    name="name"

                    placeholder="Full Name"

                    value={formData.name}

                    onChange={handleChange}

                    required

                />



                <input

                    type="email"

                    name="email"

                    placeholder="Email"

                    value={formData.email}

                    onChange={handleChange}

                    required

                />



                <input

                    type="tel"

                    name="phone"

                    placeholder="Phone (0912345678)"

                    value={formData.phone}

                    onChange={handleChange}

                    maxLength="10"

                    required

                />



                <input

                    type="password"

                    name="password"

                    placeholder="Password"

                    value={formData.password}

                    onChange={handleChange}

                    required

                />



                <input

                    type="password"

                    name="confirmPassword"

                    placeholder="Confirm Password"

                    value={formData.confirmPassword}

                    onChange={handleChange}

                    required

                />



                <button type="submit">

                    Register

                </button>



                <p className="login-link">

                    Already have an account?

                    <Link to="/login">

                        Login

                    </Link>


                </p>



            </form>


        </div>


    );

}



export default Register;