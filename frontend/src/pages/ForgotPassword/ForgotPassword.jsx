import { useState } from "react";
import "./ForgotPassword.css";
import API from "../../api/axios";
import { Link } from "react-router-dom";


function ForgotPassword(){

    const [email,setEmail] = useState("");
    const [message,setMessage] = useState("");
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(false);


    const submitHandler = async(e)=>{

        e.preventDefault();

        setMessage("");
        setError("");

        try{

            setLoading(true);


            const response = await API.post(
                "/auth/forgot-password",
                {
                    email
                }
            );


            setMessage(
                response.data.message +
                "\nToken: " +
                response.data.resetToken
            );


        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

        }
        finally{

            setLoading(false);

        }

    };



    return(

        <div className="forgot-container">


            <div className="forgot-box">


                <h1>
                    Forgot Password
                </h1>


                <p>
                    Enter your email to reset your password
                </p>



                <form onSubmit={submitHandler}>


                    <input

                        type="email"

                        placeholder="Enter your email"

                        value={email}

                        onChange={(e)=>setEmail(e.target.value)}

                        required

                    />



                    <button type="submit">

                        {
                            loading
                            ?
                            "Sending..."
                            :
                            "Reset Password"
                        }

                    </button>


                </form>




                {
                    message &&
                    <div className="success-message">

                        {message}

                    </div>
                }



                {
                    error &&
                    <div className="error-message">

                        {error}

                    </div>
                }



                <Link to="/login">

                    Back to Login

                </Link>



            </div>


        </div>

    );

}


export default ForgotPassword;