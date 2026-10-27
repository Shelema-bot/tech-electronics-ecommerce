import Review from "../models/Review.js";


// GET PRODUCT REVIEWS

export const getProductReviews = async(req,res)=>{

    try{

        const reviews = await Review.find({

            product:req.params.id

        })
        .populate("user","name");


        res.json(reviews);


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};




// CREATE REVIEW

export const createReview = async(req,res)=>{


    try{


        const review = new Review({

            product:req.params.id,

            user:req.user._id,

            name:req.user.name,

            rating:req.body.rating,

            comment:req.body.comment

        });



        const createdReview = await review.save();


        res.status(201).json(createdReview);



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};