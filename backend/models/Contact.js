// models/Contact.js

import mongoose from "mongoose";


const contactSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },


    email:{
        type:String,
        required:true
    },


    subject:{
        type:String,
        required:true
    },


    message:{
        type:String,
        required:true
    },


    status:{
        type:String,
        enum:[
            "new",
            "read",
            "replied"
        ],
        default:"new"
    },


    reply:{
        type:String,
        default:""
    },

    screenshot:{
        type:String,
        default:""
    },

    repliedAt:{
        type:Date
    }


},
{
    timestamps:true
});


export default mongoose.model(
    "Contact",
    contactSchema
);