import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    brand: String,
    category: String,
    price: {
      type: Number,
      required: true,
    },
    category: {
    type: String,
    required: true,
    trim: true,
},
    stock: {
      type: Number,
      default: 0,
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);