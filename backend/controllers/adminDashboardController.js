import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";


// GET ADMIN DASHBOARD DATA

export const getDashboardStats = async(req,res)=>{

    try{


        const customers =
        await User.countDocuments({
            role:"customer"
        });


        const products =
        await Product.countDocuments();



        const orders =
        await Order.countDocuments();



        const sales =
        await Order.aggregate([
            {
                $match:{
                    isPaid:true
                }
            },
            {
                $group:{
                    _id:null,
                    total:{
                        $sum:"$totalPrice"
                    }
                }
            }
        ]);



        res.status(200).json({

            success:true,

            customers,

            products,

            orders,

            sales:
            sales.length > 0
            ? sales[0].total
            : 0

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};