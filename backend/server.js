import express from "express";
import cors from "cors";
import { connectDB, getDB } from "./db.js";

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

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    console.log("User found:", user);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        bio: user.bio || "No bio yet.",
        joined: user.createdAt.toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, name, bio } = req.body;

    // Validate all required fields are present and not empty after trimming
    if (!username || !password || !name || !bio) {
      return res.status(400).json({ error: "All fields required" });
    }

    const trimmedBio = bio.trim();
    if (!trimmedBio) {
      return res.status(400).json({ error: "Bio cannot be empty" });
    }

    const db = getDB();
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const userData = {
      username: username.trim(),
      password,
      name: name.trim(),
      bio: trimmedBio,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(userData);

    res.status(201).json({
      success: true,
      user: {
        id: result.insertedId,
        username: userData.username,
        name: userData.name,
        bio: userData.bio,
        joined: new Date().toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Posts route
app.get("/api/posts", async (req, res) => {
  try {
    const db = getDB();
    const posts = await db
      .collection("posts")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(posts);
  } catch (error) {
    console.error("Posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create post route
app.post("/api/posts", async (req, res) => {
  try {
    const { username, title, content, imageUrl } = req.body;

    if (!username || !title || !content) {
      return res
        .status(400)
        .json({ error: "Username, title, and content required" });
    }

    const db = getDB();
    const result = await db.collection("posts").insertOne({
      username,
      title,
      content,
      imageUrl: imageUrl || "/img/post.png",
      likeCount: 0,
      comments: [],
      createdAt: new Date(),
      timestamp: new Date().toLocaleString(),
      postId: Date.now().toString(),
    });

    const newPost = await db
      .collection("posts")
      .findOne({ _id: result.insertedId });
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(5001, () => {
  console.log(`Server running on http://localhost:5001`);
});
