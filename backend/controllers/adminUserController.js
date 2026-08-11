import User from "../models/User.js";


// GET ALL USERS (ADMIN)
export const getAllUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select("-password");

        res.json(users);

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }
};



// UPDATE USER ROLE
export const updateUserRole = async (req,res)=>{

    try{

        const user = await User.findById(req.params.id);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        user.role = req.body.role;

        await user.save();


        res.json({
            message:"Role updated successfully",
            user
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



// ACTIVATE / DEACTIVATE USER

export const updateUserStatus = async(req,res)=>{

    try{

        const user = await User.findById(req.params.id);


        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        user.isActive = req.body.isActive;


        await user.save();


        res.json({
            message:"Status updated",
            user
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};