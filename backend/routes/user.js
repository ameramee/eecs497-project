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

// Search users route
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const db = getDB();
    const searchQuery = q.trim();

    // Search by username or name (case-insensitive)
    const users = await db
      .collection("users")
      .find({
        $or: [
          { username: { $regex: searchQuery, $options: "i" } },
          { name: { $regex: searchQuery, $options: "i" } },
        ],
      })
      .limit(20)
      .toArray();

    // Return only public user info (no password)
    const publicUsers = users.map((user) => ({
      username: user.username,
      name: user.name,
      bio: user.bio || "No bio yet.",
      joined: user.createdAt.toLocaleDateString(),
    }));

    res.json(publicUsers);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by username route
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return only public user info (no password)
    res.json({
      username: user.username,
      name: user.name,
      bio: user.bio || "No bio yet.",
      joined: user.createdAt.toLocaleDateString(),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send friend request route
router.post("/friend-request", async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;

    if (!fromUsername || !toUsername) {
      return res.status(400).json({ error: "Both usernames required" });
    }

    if (fromUsername === toUsername) {
      return res
        .status(400)
        .json({ error: "Cannot send friend request to yourself" });
    }

    const db = getDB();

    // Verify both users exist
    const fromUser = await db
      .collection("users")
      .findOne({ username: fromUsername });
    const toUser = await db
      .collection("users")
      .findOne({ username: toUsername });

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize friends arrays if they don't exist
    if (!fromUser.friends) {
      await db
        .collection("users")
        .updateOne(
          { username: fromUsername },
          { $set: { friends: [], friendRequests: { sent: [], received: [] } } }
        );
    }
    if (!toUser.friends) {
      await db
        .collection("users")
        .updateOne(
          { username: toUsername },
          { $set: { friends: [], friendRequests: { sent: [], received: [] } } }
        );
    }

    // Check if already friends
    const updatedFromUser = await db
      .collection("users")
      .findOne({ username: fromUsername });
    const updatedToUser = await db
      .collection("users")
      .findOne({ username: toUsername });

    if (
      updatedFromUser.friends?.includes(toUsername) ||
      updatedToUser.friends?.includes(fromUsername)
    ) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Check if friend request already sent
    if (updatedFromUser.friendRequests?.sent?.includes(toUsername)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if there's a pending request from the other user
    if (updatedFromUser.friendRequests?.received?.includes(toUsername)) {
      // Automatically accept and make them friends
      await db.collection("users").updateOne(
        { username: fromUsername },
        {
          $pull: { "friendRequests.received": toUsername },
          $addToSet: { friends: toUsername },
        }
      );
      await db.collection("users").updateOne(
        { username: toUsername },
        {
          $pull: { "friendRequests.sent": fromUsername },
          $addToSet: { friends: fromUsername },
        }
      );

      return res.json({
        message: "Friend request accepted automatically",
        accepted: true,
      });
    }

    // Send friend request
    await db
      .collection("users")
      .updateOne(
        { username: fromUsername },
        { $addToSet: { "friendRequests.sent": toUsername } }
      );
    await db
      .collection("users")
      .updateOne(
        { username: toUsername },
        { $addToSet: { "friendRequests.received": fromUsername } }
      );

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Accept friend request route
router.post("/friend-request/accept", async (req, res) => {
  try {
    const { username, fromUsername } = req.body;

    if (!username || !fromUsername) {
      return res.status(400).json({ error: "Both usernames required" });
    }

    const db = getDB();

    // Verify users exist
    const user = await db.collection("users").findOne({ username });
    const fromUser = await db
      .collection("users")
      .findOne({ username: fromUsername });

    if (!user || !fromUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if friend request exists
    if (!user.friendRequests?.received?.includes(fromUsername)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    // Add each other as friends and remove from friend requests
    await db.collection("users").updateOne(
      { username },
      {
        $pull: { "friendRequests.received": fromUsername },
        $addToSet: { friends: fromUsername },
      }
    );
    await db.collection("users").updateOne(
      { username: fromUsername },
      {
        $pull: { "friendRequests.sent": username },
        $addToSet: { friends: username },
      }
    );

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reject friend request route
router.post("/friend-request/reject", async (req, res) => {
  try {
    const { username, fromUsername } = req.body;

    if (!username || !fromUsername) {
      return res.status(400).json({ error: "Both usernames required" });
    }

    const db = getDB();

    // Remove friend request
    await db
      .collection("users")
      .updateOne(
        { username },
        { $pull: { "friendRequests.received": fromUsername } }
      );
    await db
      .collection("users")
      .updateOne(
        { username: fromUsername },
        { $pull: { "friendRequests.sent": username } }
      );

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get friends list route
router.get("/:username/friends", async (req, res) => {
  try {
    const { username } = req.params;

    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendsList = user.friends || [];

    // Get friend details
    const friends = await db
      .collection("users")
      .find({ username: { $in: friendsList } })
      .toArray();

    const friendsInfo = friends.map((friend) => ({
      username: friend.username,
      name: friend.name,
      bio: friend.bio || "No bio yet.",
      joined: friend.createdAt.toLocaleDateString(),
    }));

    res.json(friendsInfo);
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get friend requests route
router.get("/:username/friend-requests", async (req, res) => {
  try {
    const { username } = req.params;

    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const receivedRequests = user.friendRequests?.received || [];

    // Get request sender details
    const requesters = await db
      .collection("users")
      .find({ username: { $in: receivedRequests } })
      .toArray();

    const requestersInfo = requesters.map((requester) => ({
      username: requester.username,
      name: requester.name,
      bio: requester.bio || "No bio yet.",
      joined: requester.createdAt.toLocaleDateString(),
    }));

    res.json(requestersInfo);
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get friend status route (to check if users are friends, has pending request, etc.)
router.get("/:username/friend-status/:otherUsername", async (req, res) => {
  try {
    const { username, otherUsername } = req.params;

    const db = getDB();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friends = user.friends || [];
    const sentRequests = user.friendRequests?.sent || [];
    const receivedRequests = user.friendRequests?.received || [];

    let status = "none";
    if (friends.includes(otherUsername)) {
      status = "friends";
    } else if (sentRequests.includes(otherUsername)) {
      status = "request_sent";
    } else if (receivedRequests.includes(otherUsername)) {
      status = "request_received";
    }

    res.json({ status });
  } catch (error) {
    console.error("Get friend status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { username, name, bio, profilePic } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = getDB();

    const result = await db.collection("users").updateOne(
      { username },
      {
        $set: {
          name,
          bio,
          profilePic,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
