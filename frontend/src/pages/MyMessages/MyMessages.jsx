import { useEffect,useState } from "react";
import API from "../../api/axios";
import "./MyMessages.css";


function MyMessages(){


const [messages,setMessages]=useState([]);



const getMessages=async()=>{


try{


const res=await API.get(

"/contact/my-messages",

{

headers:{

Authorization:
`Bearer ${localStorage.getItem("token")}`

}

}

);


setMessages(res.data);



}
catch(error){

console.log(error);

}


};




useEffect(()=>{


getMessages();


},[]);




return(


<div className="my-messages">


<h1>
My Contact Messages
</h1>



{

messages.length===0 ?


<h2>
No messages found
</h2>


:


messages.map(message=>(


<div

className="message-card"

key={message._id}

>


<h3>

{message.subject}

</h3>



<p>

{message.message}

</p>



<p>

Status:

<strong>

{" "}

{message.status}

</strong>

</p>





{

message.reply &&


<div className="admin-reply">


<h4>
Admin Reply
</h4>


<p>

{message.reply}

</p>


</div>


}




</div>


))


}



</div>


);


}


export default MyMessages;