import Product from "../models/Product.js";


// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {

    try {

        const products = await Product.find();

        res.status(200).json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// @desc    Get products by category
// @route   GET /api/products/category/:categoryName
// @access  Public
export const getProductsByCategory = async (req, res) => {

    try {

        const products = await Product.find({
            category: req.params.categoryName
        });


        res.status(200).json(products);


    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.status(200).json(product);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// @desc    Create product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {

    try {

        // Get images uploaded by Multer
        const imageUrls = req.files
            ? req.files.map(file => file.path)
            : [];


        const {
            name,
            price,
            category
        } = req.body;


        // Validate required fields
        if (!name || !price || !category) {

            return res.status(400).json({
                message: "Name, price, and category are required"
            });

        }


        // Create new product
        const product = await Product.create({

            ...req.body,

            images: imageUrls

        });


        res.status(201).json({

            message: "Product created successfully",

            product

        });


    } catch (error) {

        console.log("Create Product Error:", error);


        res.status(500).json({

            message: error.message

        });

    }

};