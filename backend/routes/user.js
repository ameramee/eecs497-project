// routes/user.js
import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
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
router.post("/register", async (req, res) => {
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

export default router;
