import User from "../models/User.js";


// ===============================
// GET USER PROFILE
// ===============================
export const getUserProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id)
        .select("-password");


        if (!user) {

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }


        res.status(200).json({

            success:true,

            user

        });


    } catch(error) {

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};





// ===============================
// UPDATE USER PROFILE
// ===============================
export const updateUserProfile = async(req,res)=>{

    try{


        const user = await User.findById(req.user._id);



        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }




        user.name =

        req.body.name || user.name;



        user.phone =

        req.body.phone || user.phone;



        user.address =

        req.body.address || user.address;




        // profile image upload

        if(req.file){

            user.profileImage =

            req.file.path;

        }




        const updatedUser =

        await user.save();





        res.status(200).json({

            success:true,

            user:updatedUser

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







// ===============================
// GET ADMIN PROFILE
// ===============================
export const getAdminProfile = async(req,res)=>{

    try{


        const user = await User.findById(req.user._id)
        .select("-password");



        res.status(200).json({

            success:true,

            user

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};







// ===============================
// UPDATE ADMIN PROFILE
// ===============================
export const updateAdminProfile = async(req,res)=>{

    try{


        const user = await User.findById(req.user._id);



        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }




        user.name =

        req.body.name || user.name;



        user.phone =

        req.body.phone || user.phone;



        user.address =

        req.body.address || user.address;




        if(req.file){

            user.profileImage =

            req.file.path;

        }




        const updatedUser =

        await user.save();




        res.status(200).json({

            success:true,

            user:updatedUser

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};