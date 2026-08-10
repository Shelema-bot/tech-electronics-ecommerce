// ContactMessages.jsx

import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./ContactMessages.css";


function ContactMessages() {


    const [messages,setMessages] =
        useState([]);


    const [loading,setLoading] =
        useState(true);


    const [selectedMessage,setSelectedMessage] =
        useState(null);


    const [replyText,setReplyText] =
        useState("");



    const authConfig = {

        headers: {

            Authorization:
                `Bearer ${localStorage.getItem("token")}`

        }

    };



    useEffect(()=>{

        getMessages();

    },[]);





    const getMessages = async()=>{


        try{


            const res = await API.get(

                "/contact/admin",

                authConfig

            );


            setMessages(

                res.data

            );


        }

        catch(error){


            console.log(

                "CONTACT ERROR:",

                error.response?.data ||
                error.message

            );


        }

        finally{


            setLoading(false);


        }


    };







    const updateStatus = async(id,status)=>{


        try{


            await API.put(

                `/contact/admin/${id}`,

                {
                    status:status
                },

                authConfig

            );


            getMessages();


        }

        catch(error){


            console.log(error);


        }


    };







    const sendReply = async(id)=>{


        if(!replyText.trim()){


            alert(
                "Please write reply"
            );


            return;


        }



        try{


            await API.put(

                `/contact/admin/reply/${id}`,

                {
                    reply:replyText
                },

                authConfig

            );



            alert(

                "Reply sent successfully"

            );



            setReplyText("");

            setSelectedMessage(null);


            getMessages();



        }

        catch(error){


            console.log(

                "REPLY ERROR:",

                error.response?.data ||
                error.message

            );


            alert(

                "Reply failed"

            );


        }


    };







    const deleteMessage = async(id)=>{


        const confirmDelete =
            window.confirm(
                "Delete this message?"
            );


        if(!confirmDelete) return;



        try{


            await API.delete(

                `/contact/admin/${id}`,

                authConfig

            );



            getMessages();



        }

        catch(error){


            console.log(error);


        }


    };







    if(loading){


        return(

            <div className="contact-loading">

                <h2>
                    Loading messages...
                </h2>

            </div>

        );


    }






    return(



        <div className="admin-contacts">





            <div className="contacts-header">


                <div>


                    <h1>
                        Contact Messages
                    </h1>


                    <p>
                        Manage customer messages
                    </p>


                </div>



                <div className="message-count">

                    {messages.length}

                    <span>
                        Messages
                    </span>

                </div>


            </div>









            {

            messages.length === 0 ?


            (

                <div className="no-contact-messages">


                    <h2>
                        No Messages Found
                    </h2>


                </div>

            )


            :


            (



            <div className="contact-table-container">



            <table className="contact-table">


            <thead>


            <tr>


                <th>
                    Customer
                </th>


                <th>
                    Email
                </th>


                <th>
                    Subject
                </th>


                <th>
                    Message
                </th>


                <th>
                    Status
                </th>


                <th>
                    Action
                </th>


            </tr>


            </thead>





            <tbody>


            {

            messages.map((message)=>(



            <tr key={message._id}>


                <td>

                    {message.name}

                </td>




                <td>

                    {message.email}

                </td>




                <td>

                    {message.subject}

                </td>




                <td>

                    <div className="message-text">

                        {message.message}

                    </div>

                </td>





                <td>


                    <select

                    value={message.status}

                    onChange={(e)=>

                        updateStatus(

                            message._id,

                            e.target.value

                        )

                    }

                    className={
                        `message-status ${message.status}`
                    }

                    >


                        <option value="new">
                            New
                        </option>


                        <option value="read">
                            Read
                        </option>


                        <option value="replied">
                            Replied
                        </option>


                    </select>


                </td>






                <td>


                    <button

                    className="reply-message-btn"

                    onClick={()=>


                        setSelectedMessage(

                            message

                        )


                    }

                    >

                        Reply

                    </button>





                    <button

                    className="delete-message-btn"

                    onClick={()=>


                        deleteMessage(

                            message._id

                        )


                    }

                    >

                        Delete

                    </button>


                </td>



            </tr>


            ))

            }



            </tbody>



            </table>



            </div>


            )

            }








            {


            selectedMessage &&


            (

            <div className="reply-box">


                <h2>

                    Reply To:

                    {" "}

                    {selectedMessage.name}

                </h2>




                <textarea


                value={replyText}


                onChange={(e)=>

                    setReplyText(

                        e.target.value

                    )

                }


                placeholder="Write reply..."

                />





                <div className="reply-actions">



                    <button

                    className="send-reply-btn"

                    onClick={()=>


                        sendReply(

                            selectedMessage._id

                        )


                    }

                    >

                        Send Reply

                    </button>





                    <button

                    className="cancel-reply-btn"

                    onClick={()=>{


                        setSelectedMessage(null);

                        setReplyText("");


                    }}

                    >

                        Cancel

                    </button>




                </div>




            </div>

            )


            }



        </div>



    );

}


export default ContactMessages;