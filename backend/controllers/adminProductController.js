import Product from "../models/Product.js";

// =================================
// CREATE PRODUCT (ADMIN)
// =================================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discountPrice,
      category,
      brand,
      stock
    } = req.body;

    // Get uploaded image paths
    const imagePaths = req.files
      ? req.files.map(file => file.path)
      : [];

    const finalPrice = Number(discountPrice || price);

    if (!name || isNaN(finalPrice) || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price and category are required"
      });
    }

    const product = await Product.create({
      name,
      description,
      price: finalPrice,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountPrice: discountPrice ? Number(discountPrice) : finalPrice,
      category,
      brand,
      stock: Number(stock) || 0,
      images: imagePaths,
      isPublic: true,
      approvalStatus: "approved",
    });

    console.log("PRODUCT SAVED:", product);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.log("CREATE PRODUCT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================================
// GET ALL PRODUCTS (ADMIN)
// =================================
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================================
// GET SINGLE PRODUCT
// =================================
export const getProductByIdAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================================
// UPDATE PRODUCT (ADMIN)
// =================================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (req.body.name) product.name = req.body.name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.originalPrice !== undefined) {
      product.originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : null;
    }
    if (req.body.discountPrice !== undefined) {
      product.discountPrice = req.body.discountPrice ? Number(req.body.discountPrice) : null;
    }
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand !== undefined) product.brand = req.body.brand;
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);

    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =================================
// DELETE PRODUCT (ADMIN)
// =================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
