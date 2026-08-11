import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tx_ref: {
      type: String,
      required: true,
      unique: true,
    },
    
    status: {
      type: String,
      default: "Pending",
    },
    paidAt:{
 type:Date
}
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);