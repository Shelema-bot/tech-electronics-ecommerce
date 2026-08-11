import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";


// Generate JWT Token
const generateToken = (id, role) => {

    return jwt.sign(
        {
            id,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    );

};




// ==========================
// Register User
// ==========================

export const registerUser = async (req,res)=>{

    try{


        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body;



        if(!name || !email || !password){

            return res.status(400).json({

                success:false,

                message:"Name, email and password are required"

            });

        }



        const existingUser = await User.findOne({
            email
        });



        if(existingUser){

            return res.status(400).json({

                success:false,

                message:"User already exists"

            });

        }



        const hashedPassword = await bcrypt.hash(
            password,
            10
        );



        const user = await User.create({

            name,

            email,

            password:hashedPassword,

            phone,

            address,

            role:"customer"

        });



        const token = generateToken(
            user._id,
            user.role
        );



        return res.status(201).json({

            success:true,

            message:"Registration successful",

            user:{

                id:user._id,

                name:user.name,

                email:user.email,

                phone:user.phone,

                address:user.address,

                profileImage:user.profileImage,

                role:user.role

            },

            token

        });



    }
    catch(error){


        console.log(
            "REGISTER ERROR:",
            error.message
        );


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }

};





// ==========================
// Login User
// ==========================

export const loginUser = async(req,res)=>{


    try{


        const {
            email,
            password
        } = req.body;



        if(!email || !password){

            return res.status(400).json({

                success:false,

                message:"Email and password are required"

            });

        }



        const user = await User.findOne({
            email
        });



        if(!user){

            return res.status(401).json({

                success:false,

                message:"Invalid email or password"

            });

        }




        const passwordMatch =
        await bcrypt.compare(
            password,
            user.password
        );



        if(!passwordMatch){

            return res.status(401).json({

                success:false,

                message:"Invalid email or password"

            });

        }




        const token = generateToken(
            user._id,
            user.role
        );



        return res.status(200).json({

            success:true,

            message:"Login successful",


            user:{

                id:user._id,

                name:user.name,

                email:user.email,

                phone:user.phone,

                address:user.address,

                profileImage:user.profileImage,

                role:user.role

            },


            token


        });



    }
    catch(error){


        console.log(
            "LOGIN ERROR:",
            error.message
        );



        return res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







// ==========================
// Forgot Password
// ==========================

export const forgotPassword = async(req,res)=>{

    try{


        const {email}=req.body;


        const user = await User.findOne({
            email
        });



        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }



        const resetToken =
        crypto.randomBytes(32).toString("hex");



        user.resetPasswordToken = resetToken;


        user.resetPasswordExpire =
        Date.now() + 15 * 60 * 1000;



        await user.save();



        res.status(200).json({

            success:true,

            message:"Password reset token created",

            resetToken

        });



    }
    catch(error){

        console.log(
            "FORGOT PASSWORD ERROR:",
            error.message
        );


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};








// ==========================
// Reset Password
// ==========================

export const resetPassword = async(req,res)=>{

    try{


        const {
            token,
            password
        } = req.body;



        const user = await User.findOne({

            resetPasswordToken:token,

            resetPasswordExpire:{
                $gt:Date.now()
            }

        });



        if(!user){

            return res.status(400).json({

                success:false,

                message:"Invalid or expired token"

            });

        }



        const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );



        user.password = hashedPassword;


        user.resetPasswordToken = "";


        user.resetPasswordExpire = null;



        await user.save();



        res.status(200).json({

            success:true,

            message:"Password updated successfully"

        });



    }
    catch(error){


        console.log(
            "RESET PASSWORD ERROR:",
            error.message
        );


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};









// ==========================
// Get Current User Profile
// ==========================

export const getProfile = async(req,res)=>{


    try{


        const user =
        await User.findById(
            req.user._id
        )
        .select("-password");



        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }



        return res.status(200).json({

            success:true,

            user

        });



    }
    catch(error){


        console.log(
            "PROFILE ERROR:",
            error.message
        );


        return res.status(500).json({

            success:false,

            message:error.message

        });


    }


};