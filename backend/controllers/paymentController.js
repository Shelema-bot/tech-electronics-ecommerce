import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

import {
    initializeChapaPayment,
    verifyChapaPayment
} from "../services/chapaService.js";



// ===============================
// Initialize Payment
// ===============================

export const initializePayment = async(req,res)=>{

try{


const {
    orderId,
    amount
}=req.body;



if(!orderId || !amount){

return res.status(400).json({

success:false,

message:"Order ID and amount are required"

});

}



const tx_ref = "TX-" + Date.now();



const names = req.user.name.split(" ");


const firstName = names[0] || "Customer";

const lastName =
names.slice(1).join(" ") || "User";





const chapaResponse =
await initializeChapaPayment({

amount,

email:req.user.email,

first_name:firstName,

last_name:lastName,

tx_ref

});






await Payment.create({

order:orderId,

user:req.user._id,

amount,

tx_ref,

status:"Pending"

});






res.json({

success:true,

message:"Payment initialized",

checkout_url:
chapaResponse.data.checkout_url,

tx_ref

});




}
catch(error){

console.log(
"PAYMENT INIT ERROR:",
error.response?.data || error.message
);


res.status(500).json({

success:false,

message:"Payment initialization failed"

});


}


};









// ===============================
// Verify Payment
// ===============================


export const verifyPayment = async(req,res)=>{


try{


const {
    tx_ref
}=req.query;



console.log(
"VERIFY TX REF:",
tx_ref
);



if(!tx_ref){


return res.status(400).json({

success:false,

message:"Transaction reference required"

});


}





const chapaResponse =
await verifyChapaPayment(tx_ref);



console.log(
"CHAPA VERIFY:",
chapaResponse
);






const payment =
await Payment.findOne({
    tx_ref
});



if(!payment){


return res.status(404).json({

success:false,

message:"Payment record not found"

});


}







// Chapa successful payment

if(
chapaResponse.status === "success" &&
chapaResponse.data.status === "success"
){



payment.status="Paid";

await payment.save();





const order =
await Order.findById(payment.order);



if(order){


order.isPaid=true;

order.paidAt=new Date();


await order.save();


}





return res.json({

success:true,

message:"Payment completed successfully"

});



}







res.json({

success:false,

message:"Payment not completed",

data:chapaResponse

});




}
catch(error){


console.log(

"VERIFY PAYMENT ERROR:",

error.response?.data || error.message

);



res.status(500).json({

success:false,

message:"Payment verification failed"

});


}



};