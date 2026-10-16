import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendOrderConfirmation, notifyAdminNewOrder } from "../utils/sendEmail.js";
import { createNotification, notifyAdmins } from "./notificationController.js";

// ===============================
// Create Order (Customer)
// ===============================
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      guestCustomer,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items in this order",
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: "Full shipping address (fullName, phone, address, city) is required",
      });
    }

    const calculatedTotal = totalPrice || (Number(itemsPrice || 0) + Number(shippingPrice || 0) + Number(taxPrice || 0));

    const userId = req.user ? req.user._id : null;
    const guest = guestCustomer || (!userId ? {
      name:  shippingAddress.fullName,
      phone: shippingAddress.phone,
      email: req.body.email || "",
    } : null);

    const order = await Order.create({
      user: userId,
      guestCustomer: guest,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: "Pending",
      status: "Pending",
      itemsPrice: Number(itemsPrice) || calculatedTotal,
      shippingPrice: Number(shippingPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      totalPrice: Number(calculatedTotal),
      isPaid: false,
    });

    // Send emails & in-app notifications in background without blocking response
    const customerEmail = req.user?.email || guest?.email;
    const customerName  = req.user?.name  || guest?.name || shippingAddress.fullName;

    if (customerEmail) {
      sendOrderConfirmation(order, customerEmail, customerName).catch(() => {});
      notifyAdminNewOrder(order, customerName).catch(() => {});
    }

    if (req.user?._id) {
      createNotification(
        req.user._id,
        "Order Placed Successfully 🛒",
        `Your order #${order._id.toString().slice(-8)} has been placed and is being processed.`,
        "order",
        "/my-orders",
        "🛒"
      ).catch(() => {});
    }

    notifyAdmins(
      "New Order Received",
      `${customerName} placed a new order worth ${Number(order.totalPrice).toLocaleString()} ETB.`,
      "order",
      "/admin/orders",
      "🛒"
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
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