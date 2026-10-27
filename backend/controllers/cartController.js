import Cart from "../models/Cart.js";

// Add Product to Cart
export const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    let cartItem = await Cart.findOne({
      user: req.user._id,
      product,
    });

    if (cartItem) {
      cartItem.quantity += quantity;

      await cartItem.save();

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cartItem,
      });
    }

    cartItem = await Cart.create({
      user: req.user._id,
      product,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get User Cart
export const getCart = async (req, res) => {
  try {

    const cart = await Cart.find({
      user: req.user._id,
    }).populate("product");

    res.status(200).json({
      success: true,
      cart,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Remove Cart Item
export const removeCartItem = async (req, res) => {
  try {

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await cartItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Cart item removed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {

    await Cart.deleteMany({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};