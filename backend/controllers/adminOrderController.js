import Order from "../models/Order.js";
import { createNotification } from "./notificationController.js";

const STATUS_MESSAGES = {
  Processing: { msg: "Your order is now being processed.",       icon: "⚙️" },
  Shipped:    { msg: "Your order has been shipped and is on its way!", icon: "🚚" },
  Delivered:  { msg: "Your order has been delivered. Enjoy!",    icon: "✅" },
  Cancelled:  { msg: "Your order has been cancelled.",           icon: "❌" },
  Pending:    { msg: "Your order is pending.",                   icon: "⏳" },
};



// =================================
// GET ALL ORDERS (ADMIN)
// =================================

export const getAllOrdersAdmin = async (req,res)=>{

    try{


        const orders = await Order.find()

        .populate(
            "user",
            "name email"
        )

        .populate(
            "orderItems.product",
            "name price"
        )

        .sort({
            createdAt:-1
        });



        return res.status(200).json({

            success:true,

            count:orders.length,

            orders

        });



    }catch(error){


        console.log(
            "GET ORDERS ERROR:",
            error.message
        );


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }

};





// =================================
// GET SINGLE ORDER
// =================================

export const getOrderByIdAdmin = async(req,res)=>{

    try{


        const order =
        await Order.findById(
            req.params.id
        )

        .populate(
            "user",
            "name email"
        )

        .populate(
            "orderItems.product",
            "name price"
        );




        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        return res.status(200).json({

            success:true,

            order

        });



    }catch(error){


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }

};






// =================================
// UPDATE ORDER STATUS
// =================================

export const updateOrderStatus = async(req,res)=>{


    try{


        const order =
        await Order.findById(
            req.params.id
        );



        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        order.status =
        req.body.status || order.status;

        const updatedOrder =
        await order.save();

        // Notify customer about status change
        const sm = STATUS_MESSAGES[updatedOrder.status] || {};
        if (sm.msg && order.user) {
          createNotification(
            order.user,
            `Order Update: ${updatedOrder.status}`,
            `${sm.msg} Order #${order._id.toString().slice(-8)}.`,
            "order", "/my-orders", sm.icon || "📦"
          );
        }



        return res.status(200).json({

            success:true,

            message:"Order status updated",

            order:updatedOrder

        });



    }catch(error){


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







// =================================
// DELETE ORDER
// =================================

export const deleteOrderAdmin = async(req,res)=>{


    try{


        const order =
        await Order.findById(
            req.params.id
        );



        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        await order.deleteOne();



        return res.status(200).json({

            success:true,

            message:"Order deleted successfully"

        });



    }catch(error){


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }


};