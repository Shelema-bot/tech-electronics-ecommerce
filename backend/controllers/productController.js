import Product from "../models/Product.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

// @desc    Get all products (with optional pagination, search, filter, sort)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    // Show products that are either explicitly public OR have no isPublic field
    // (backward compat: all products created before the isPublic field existed)
    const filter = { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] };

    if (category) filter.category = { $regex: new RegExp(category, "i") };
    if (brand)    filter.brand    = { $regex: new RegExp(brand, "i") };
    if (search)   filter.$or = [
      { name:        { $regex: new RegExp(search, "i") } },
      { brand:       { $regex: new RegExp(search, "i") } },
      { category:    { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
    ];
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price-asc")  sortObj = { price: 1 };
    if (sort === "price-desc") sortObj = { price: -1 };
    if (sort === "name-asc")   sortObj = { name: 1 };
    if (sort === "name-desc")  sortObj = { name: -1 };
    if (sort === "rating")     sortObj = { rating: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    // Backward-compatible: paginated response when ?page or ?limit present
    if (req.query.page || req.query.limit) {
      return res.status(200).json({
        success: true,
        ...getPaginationMeta(total, page, limit),
        products,
      });
    }

    return res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryName,
      $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
    }).lean();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
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