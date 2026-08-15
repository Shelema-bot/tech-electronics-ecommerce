import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendOrderConfirmation, notifyAdminNewOrder } from "../utils/sendEmail.js";

// ===============================
// Create Order (Customer)
// ===============================
export const createOrder = async (req, res) => {

  try {

    const order = await Order.create({
      ...req.body,
      user: req.user._id,
      status: "Pending"
    });

    // Send emails in background (don't await — don't block response)
    const user = await User.findById(req.user._id).select("name email");
    if (user) {
      sendOrderConfirmation(order, user.email, user.name);
      notifyAdminNewOrder(order, user.name);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch(error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const payOrder = async(req,res)=>{

try{


const order = await Order.findById(
req.params.id
);



if(!order){

return res.status(404).json({

message:"Order not found"

});

}



order.isPaid = true;

order.paidAt = Date.now();

order.paymentResult = {

id:req.body.id || "Chapa",

status:"Paid"

};



await order.save();



res.json({

message:"Order payment updated",

order

});


}
catch(error){

res.status(500).json({

message:error.message

});

}

};


// ===============================
// Get Logged-in User Orders
// ===============================
export const getMyOrders = async(req,res)=>{

  try{


    const orders = await Order.find({

      user:req.user._id

    })

    .populate(
      "orderItems.product"
    );



    res.status(200).json({

      success:true,

      orders

    });


  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message

    });


  }

};




// ===============================
// Get Single Order
// ===============================
export const getOrderById = async(req,res)=>{

  try{


    const order = await Order.findById(

      req.params.id

    )

    .populate(
      "user",
      "name email"
    )

    .populate(
      "orderItems.product"
    );



    if(!order){

      return res.status(404).json({

        success:false,

        message:"Order not found"

      });

    }



    res.status(200).json({

      success:true,

      order

    });



  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message

    });


  }

};





// ===============================
// Admin: Get All Orders
// ===============================
export const getAllOrders = async(req,res)=>{

  try{


    const orders = await Order.find()

    .populate(
      "user",
      "name email"
    )

    .populate(
      "orderItems.product"
    )

    .sort({
      createdAt:-1
    });



    res.status(200).json({

      success:true,

      orders

    });


  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message

    });


  }

};





// ===============================
// Admin: Update Order Status
// ===============================
export const updateOrderStatus = async(req,res)=>{

  try{


    const order = await Order.findById(

      req.params.id

    );


    if(!order){

      return res.status(404).json({

        success:false,

        message:"Order not found"

      });

    }



    order.status = req.body.status;



    await order.save();



    res.status(200).json({

      success:true,

      message:"Order status updated",

      order

    });



  }catch(error){


    res.status(500).json({

      success:false,

      message:error.message

    });


  }

};
// ===============================
// Customer: Delete My Order
// ===============================
export const deleteMyOrder = async (req, res) => {

    try {

        const order = await Order.findById(
            req.params.id
        );


        // Check if order exists
        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        // Check if this order belongs
        // to the logged-in customer
        if (
            order.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message: "Not authorized to remove this order"

            });

        }


        // Delete the order
        await order.deleteOne();


        return res.status(200).json({

            success: true,

            message: "Order removed successfully"

        });


    } catch (error) {

        console.log(
            "DELETE MY ORDER ERROR:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};