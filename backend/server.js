import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS (works for local + Render)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Test route (optional but useful)
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
