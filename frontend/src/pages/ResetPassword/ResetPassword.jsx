import { useState } from "react";
import "./ResetPassword.css";
import API from "../../api/axios";
import { Link } from "react-router-dom";


function ResetPassword(){

    const [token,setToken] = useState("");
    const [password,setPassword] = useState("");

    const [message,setMessage] = useState("");
    const [error,setError] = useState("");



    const submitHandler = async(e)=>{

        e.preventDefault();

        setMessage("");
        setError("");


        try{


            const response = await API.post(
                "/auth/reset-password",
                {
                    token,
                    password
                }
            );


            setMessage(
                response.data.message
            );


        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Reset failed"
            );

        }

    };



    return(

        <div className="reset-container">


            <div className="reset-box">


                <h1>
                    Reset Password
                </h1>


                <form onSubmit={submitHandler}>


                    <input

                    type="text"

                    placeholder="Enter reset token"

                    value={token}

                    onChange={(e)=>setToken(e.target.value)}

                    required

                    />



                    <input

                    type="password"

                    placeholder="New password"

                    value={password}

                    onChange={(e)=>setPassword(e.target.value)}

                    required

                    />



                    <button type="submit">

                        Update Password

                    </button>



                </form>



                {
                    message &&
                    <p className="success">
                        {message}
                    </p>
                }



                {
                    error &&
                    <p className="error">
                        {error}
                    </p>
                }



                <Link to="/login">

                    Back to Login

                </Link>


            </div>


        </div>

    );


}


export default ResetPassword;