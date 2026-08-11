import Payment from "../models/Payment.js";


// =================================
// GET ALL PAYMENTS (ADMIN)
// =================================
export const getAllPaymentsAdmin = async (req, res) => {

    try {

        const payments = await Payment.find()

            .populate(
                "user",
                "name email"
            )

            .populate(
                "order",
                "_id totalPrice status"
            )

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count: payments.length,

            payments

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// =================================
// UPDATE PAYMENT STATUS (ADMIN)
// =================================
export const updatePaymentStatus = async (req, res) => {

    try {

        const payment =
            await Payment.findById(
                req.params.id
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found"

            });

        }


        payment.status =
            req.body.status || payment.status;


        const updatedPayment =
            await payment.save();


        res.status(200).json({

            success: true,

            message: "Payment status updated",

            payment: updatedPayment

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



// =================================
// DELETE PAYMENT (ADMIN)
// =================================
export const deletePaymentAdmin = async (req, res) => {

    try {

        const payment =
            await Payment.findById(
                req.params.id
            );


        if (!payment) {

            return res.status(404).json({

                success: false,

                message: "Payment not found"

            });

        }


        await payment.deleteOne();


        return res.status(200).json({

            success: true,

            message: "Payment deleted successfully"

        });


    } catch (error) {

        console.log(
            "DELETE PAYMENT ERROR:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};