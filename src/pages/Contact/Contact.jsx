import { useState } from "react";
import API from "../../api/axios";
import "./Contact.css";
import { Link } from "react-router-dom";


function Contact(){



const [form,setForm]=useState({

    name:"",
    email:"",
    subject:"",
    message:""

});



const handleChange=(e)=>{

    setForm({

        ...form,

        [e.target.name]:e.target.value

    });

};



const submitMessage=async(e)=>{

    e.preventDefault();


    try{


        await API.post(
            "/contact",
            form
        );


        alert(
            "Message sent successfully"
        );


        setForm({

            name:"",
            email:"",
            subject:"",
            message:""

        });


    }
    catch(error){


        console.log(error);

        alert(
            "Message failed"
        );


    }


};
    return(


        <div className="contact-page">



            <div className="contact-container">



                <div className="contact-info">
                    <Link
        to="/my-messages"
        className="my-messages-btn"
    >

        My Messages

    </Link>



                    <h1>
                        Contact Us
                    </h1>
                     

                    <p>
                        Have questions about our products?
                        Feel free to contact us.
                    </p>



                    <div className="contact-item">

                        <h3>
                            Address
                        </h3>

                        <p>
                            Addis Ababa, Ethiopia
                        </p>

                    </div>




                    <div className="contact-item">

                        <h3>
                            Phone
                        </h3>

                        <p>
                            +251 974007772
                        </p>

                    </div>





                    <div className="contact-item">

                        <h3>
                            Email
                        </h3>

                        <p>
                           shelemaagari@gmail.com
                        </p>

                    </div>



                </div>








                <div className="contact-form">


                    <h2>
                        Send Message
                    </h2>




                    <form onSubmit={submitMessage}>


                        <input
name="name"
value={form.name}
onChange={handleChange}
type="text"
placeholder="Your Name"
/>


<input
name="email"
value={form.email}
onChange={handleChange}
type="email"
placeholder="Your Email"
/>


<input
name="subject"
value={form.subject}
onChange={handleChange}
type="text"
placeholder="Subject"
/>


<textarea

name="message"

value={form.message}

onChange={handleChange}

placeholder="Your Message"

rows="5"

/>




                        <button>

                            Send Message

                        </button>
                        




                    </form>



                </div>






            </div>




        </div>


    );

}


export default Contact;