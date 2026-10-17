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

    // ── DUPLICATE PREVENTION ───────────────────────────────────────────
    // 1. Check if an order with this transactionId already exists
    if (cleanTxId) {
      const existingTxOrder = await Order.findOne({
        $or: [
          { transactionId: cleanTxId },
          { transactionRef: cleanTxId }
        ]
      });
      if (existingTxOrder) {
        if (cleanReceipt && !existingTxOrder.receiptImage) {
          existingTxOrder.receiptImage = cleanReceipt;
          await existingTxOrder.save().catch(() => {});
        }
        return res.status(200).json({
          success: true,
          message: "An order with this transaction reference has already been received.",
          isDuplicate: true,
          _id: existingTxOrder._id,
          order: existingTxOrder,
          ...existingTxOrder.toObject(),
        });
      }
    }

    // 2. Check if identical order was submitted within the last 60 seconds
    if (userId) {
      const recentOrder = await Order.findOne({
        user: userId,
        createdAt: { $gte: oneMinuteAgo },
        totalPrice: Number(calculatedTotal),
      }).sort({ createdAt: -1 });

      if (recentOrder) {
        const isSameItems =
          recentOrder.orderItems.length === orderItems.length &&
          recentOrder.orderItems.every((item, idx) => {
            const p1 = String(item.product?._id || item.product);
            const p2 = String(orderItems[idx]?.product?._id || orderItems[idx]?.product || orderItems[idx]?.id);
            return p1 === p2 && Number(item.quantity) === Number(orderItems[idx]?.quantity);
          });

        if (isSameItems) {
          let updated = false;
          if (cleanTxId && !recentOrder.transactionId) {
            recentOrder.transactionId = cleanTxId;
            recentOrder.transactionRef = cleanTxId;
            updated = true;
          }
          if (cleanReceipt && !recentOrder.receiptImage) {
            recentOrder.receiptImage = cleanReceipt;
            updated = true;
          }
          if (updated) await recentOrder.save().catch(() => {});

          return res.status(200).json({
            success: true,
            message: "Duplicate order submission prevented. Your order is already being processed.",
            isDuplicate: true,
            _id: recentOrder._id,
            order: recentOrder,
            ...recentOrder.toObject(),
          });
        }
      }
    }

    const guest = guestCustomer || (!userId ? {
      name:  formattedShipping.fullName,
      phone: formattedShipping.phone,
      email: req.body.email || "",
    } : null);

    const order = await Order.create({
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
      receiptImage: cleanReceipt,
      transactionId: cleanTxId,
      transactionRef: cleanTxId,
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