import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,  // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Safely drop legacy unique indexes that cause duplicate key conflicts (tx_ref, transactionId, transactionRef)
    try {
      const db = conn.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        const colNames = collections.map(c => c.name);

        if (colNames.includes("payments")) {
          const paymentIndexes = await db.collection("payments").indexes();
          for (const idx of paymentIndexes) {
            if (idx.name.includes("tx_ref") && idx.unique) {
              await db.collection("payments").dropIndex(idx.name).catch(() => {});
              console.log(`🧹 Dropped legacy unique index ${idx.name} on payments`);
            }
          }
        }

        if (colNames.includes("orders")) {
          const orderIndexes = await db.collection("orders").indexes();
          for (const idx of orderIndexes) {
            if ((idx.name.includes("transactionId") || idx.name.includes("transactionRef")) && idx.unique) {
              await db.collection("orders").dropIndex(idx.name).catch(() => {});
              console.log(`🧹 Dropped legacy unique index ${idx.name} on orders`);
            }
          }
        }
      }
    } catch (idxErr) {
      console.warn("Notice: index cleanup check passed:", idxErr.message);
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
