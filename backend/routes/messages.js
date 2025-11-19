import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// Send a message to a friend
router.post("/send", async (req, res) => {
  try {
    const { fromUsername, toUsername, content } = req.body;
    if (!fromUsername || !toUsername || !content) {
      return res.status(400).json({ error: "All fields required" });
    }
    const db = getDB();
    // Check both users exist
    const fromUser = await db
      .collection("users")
      .findOne({ username: fromUsername });
    const toUser = await db
      .collection("users")
      .findOne({ username: toUsername });
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if they are friends
    if (!fromUser.friends?.includes(toUsername)) {
      return res
        .status(403)
        .json({ error: "You can only message your friends" });
    }
    // Insert message
    const message = {
      from: fromUsername,
      to: toUsername,
      content,
      timestamp: new Date(),
    };
    await db.collection("messages").insertOne(message);
    res.json({ success: true, message: "Message sent" });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages between two friends
router.get("/history", async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both usernames required" });
    }
    const db = getDB();
    // Check both users exist
    const u1 = await db.collection("users").findOne({ username: user1 });
    const u2 = await db.collection("users").findOne({ username: user2 });
    if (!u1 || !u2) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if they are friends
    if (!u1.friends?.includes(user2)) {
      return res
        .status(403)
        .json({ error: "You can only view messages with friends" });
    }
    // Get messages
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { from: user1, to: user2 },
          { from: user2, to: user1 },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
