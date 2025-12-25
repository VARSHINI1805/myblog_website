import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "myblog",
    });

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // ❌ DO NOT use process.exit(1) on Render
  }
};

export default connectDB;
