// Load environment variables FIRST - this must be imported before anything else
import "./config.js";

import express from "express";
import { connectDB } from "./db.js";
import userRoutes from "./routes/user.js";
import postsRoutes from "./routes/posts.js";

const app = express();

// CORS configuration - MUST be FIRST, before any routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Body parsing middleware
app.use(express.json());

// Connect to MongoDB before starting server
await connectDB();

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.use("/api/user", userRoutes);
app.use("/api/posts", postsRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(5001, () => {
  console.log(`Server running on http://localhost:5001`);
});
