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
      receiptImage,
      transactionId,
      transactionRef,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items in this order",
      });
    }

    const shipping = shippingAddress || {};
    const formattedShipping = {
      fullName:   (shipping.fullName || req.user?.name || "Customer").toString().trim(),
      phone:      (shipping.phone || "N/A").toString().trim(),
      address:    (shipping.address || "N/A").toString().trim(),
      city:       (shipping.city || "Addis Ababa").toString().trim(),
      postalCode: (shipping.postalCode || "").toString().trim(),
      country:    (shipping.country || "Ethiopia").toString().trim(),
    };

    if (!shipping.fullName && !req.user?.name) {
      return res.status(400).json({
        success: false,
        message: "Full name is required for shipping",
      });
    }

    const calculatedTotal = totalPrice !== undefined
      ? Number(totalPrice)
      : (Number(itemsPrice || 0) + Number(shippingPrice || 0) + Number(taxPrice || 0));

    const userId = req.user ? req.user._id : null;
    const cleanTxId = (transactionId || transactionRef || "").toString().trim();
    const cleanReceipt = (receiptImage || "").toString().trim();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // ── DUPLICATE TRANSACTION CHECK ───────────────────────────────────────
    // Only check for duplicate transactionId if a transactionId is actually provided and not empty/null
    if (cleanTxId !== "") {
      const existingOrder = await Order.findOne({
        $or: [
          { transactionId: cleanTxId, isPaid: true },
          { transactionRef: cleanTxId, isPaid: true },
          { transactionId: cleanTxId, paymentStatus: "Paid" },
          { transactionRef: cleanTxId, paymentStatus: "Paid" },
          ...(userId ? [
            { transactionId: cleanTxId, user: { $ne: userId } },
            { transactionRef: cleanTxId, user: { $ne: userId } }
          ] : [
            { transactionId: cleanTxId },
            { transactionRef: cleanTxId }
          ])
        ]
      });

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: "This Transaction ID has already been used for another order. Please check your transaction number."
        });
      }
    }

    const guest = guestCustomer || (!userId ? {
      name:  formattedShipping.fullName,
      phone: formattedShipping.phone,
      email: req.body.email || "",
    } : null);

    const newOrderData = {
      user: userId,
      guestCustomer: guest,
      orderItems,
      shippingAddress: formattedShipping,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: "Pending",
      status: "Pending",
      itemsPrice: Number(itemsPrice) || calculatedTotal,
      shippingPrice: Number(shippingPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      totalPrice: Number(calculatedTotal),
      isPaid: false,
      receiptImage: cleanReceipt || "",
    };

    // Only attach transactionId / transactionRef if provided to prevent empty-string index collision
    if (cleanTxId) {
      newOrderData.transactionId = cleanTxId;
      newOrderData.transactionRef = cleanTxId;
    }

    const order = await Order.create(newOrderData);

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
      _id: order._id,
      order,
      ...order.toObject(),
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