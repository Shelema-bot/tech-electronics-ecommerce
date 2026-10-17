import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Logged-in user (optional to support guest checkout)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Guest customer details (if user not logged in)
    guestCustomer: {
      name:  { type: String },
      email: { type: String },
      phone: { type: String },
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name:     { type: String, required: true },
        image:    { type: String },
        price:    { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],

    shippingAddress: {
      fullName:   { type: String, required: true },
      phone:      { type: String, required: true },
      address:    { type: String, required: true },
      city:       { type: String, required: true },
      postalCode: { type: String, default: "" },
      country:    { type: String, default: "Ethiopia" },
    },

    // Payment method: "Chapa", "COD", "Cash on Delivery", "CBE Birr", "Telebirr", "Bank of Abyssinia", "Awash Bank", or custom
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    // Payment status lifecycle
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Awaiting Payment", "Pending Verification"],
      default: "Pending",
    },

    // Receipt image URL for manual mobile/bank transfer screenshot
    receiptImage: {
      type: String,
      default: "",
    },

    // Transaction ID for manual bank transfers / mobile banking
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    // Gateway transaction reference (tx_ref or customer reference)
    transactionRef: {
      type: String,
      trim: true,
    },

    // Order fulfillment status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    itemsPrice:    { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },

    // Payment timestamp & legacy boolean flag (backward compatibility)
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    alreadyStockDecremented: {
      type: Boolean,
      default: false,
    },


    paymentResult: {
      id:     { type: String },
      status: { type: String },
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Keep transactionId and transactionRef in sync
orderSchema.pre("save", function (next) {
  if (this.transactionId && !this.transactionRef) {
    this.transactionRef = this.transactionId;
  } else if (this.transactionRef && !this.transactionId) {
    this.transactionId = this.transactionRef;
  }
  next();
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ transactionRef: 1 }, { sparse: true });
orderSchema.index({ transactionId: 1 }, { sparse: true });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;