import Contact from "../models/Contact.js";


// =================================
// SEND CONTACT MESSAGE (with optional screenshot)
// =================================
// POST /api/contact
// Public
export const sendContactMessage = async (req, res) => {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;


        if (!name || !email || !subject || !message) {

            return res.status(400).json({

                message: "All fields are required"

            });

        }

        // Screenshot uploaded via Cloudinary (optional)
        const screenshotUrl = req.file ? req.file.path : "";

        const contact = await Contact.create({

            name,
            email,
            subject,
            message,
            screenshot: screenshotUrl

        });


        res.status(201).json({

            message: "Message sent successfully",

            contact

        });


    } catch (error) {

        console.log("CONTACT ERROR:", error);

        res.status(500).json({

            message: error.message

        });

    }

};



// =================================
// GET ALL CONTACT MESSAGES
// =================================
// GET /api/contact/admin
// Admin
export const getContactMessages = async (req, res) => {

    try {

        const messages = await Contact.find()
            .sort({ createdAt: -1 });


        res.status(200).json(messages);


    } catch (error) {

        console.log("GET CONTACT ERROR:", error);

        res.status(500).json({

            message: error.message

        });

    }

};

export const replyContactMessage = async(req,res)=>{


    try{


        const {reply} = req.body;


        const contact =
        await Contact.findById(
            req.params.id
        );


        if(!contact){


            return res.status(404).json({

                message:"Message not found"

            });


        }



        contact.reply = reply;

        contact.status = "replied";

        contact.repliedAt = new Date();



        await contact.save();



        res.status(200).json({

            message:"Reply saved successfully",

            contact

        });



    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};
export const getMyContactMessages = async(req,res)=>{

    try{


        const messages = await Contact.find({

            email:req.user.email

        })
        .sort({
            createdAt:-1
        });



        res.status(200).json(messages);



    }
    catch(error){


        res.status(500).json({

            message:error.message

        });


    }

};


// =================================
// UPDATE CONTACT STATUS
// =================================
// PUT /api/contact/admin/:id
// Admin
export const updateContactStatus = async (req, res) => {

    try {

        const { status } = req.body;


        if (!["new", "read", "replied"].includes(status)) {

            return res.status(400).json({

                message: "Invalid status"

            });

        }


        const contact = await Contact.findByIdAndUpdate(

            req.params.id,

            {
                status
            },

            {
                new: true
            }

        );


        if (!contact) {

            return res.status(404).json({

                message: "Message not found"

            });

        }


        res.status(200).json({

            message: "Message status updated",

            contact

        });


    } catch (error) {

        console.log("UPDATE CONTACT ERROR:", error);

        res.status(500).json({

            message: error.message

        });

    }

};



// =================================
// DELETE CONTACT MESSAGE
// =================================
// DELETE /api/contact/admin/:id
// Admin
export const deleteContactMessage = async (req, res) => {

    try {

        const contact = await Contact.findByIdAndDelete(
            req.params.id
        );


        if (!contact) {

            return res.status(404).json({

                message: "Message not found"

            });

        }


        res.status(200).json({

            message: "Message deleted successfully"

        });


    } catch (error) {

        console.log("DELETE CONTACT ERROR:", error);

        res.status(500).json({

            message: error.message

        });

    }

};