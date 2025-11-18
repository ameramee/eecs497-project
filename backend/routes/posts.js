// routes/posts.js
import express from "express";
import { getDB } from "../db.js";
import multer from "multer";
import { uploadToS3 } from "../s3.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const upload = multer();

// Posts route
router.get("/get", async (req, res) => {
  try {
    const db = getDB();
    const posts = await db.collection("posts").find().toArray();
    res.json(posts);
  } catch (error) {
    console.error("Posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/get/:username", async (req, res) => {
  try {
    const db = getDB();
    const posts = await db
      .collection("posts")
      .find({ username: req.params.username })
      .toArray();
    res.json(posts);
  } catch (error) {
    console.error("Posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create post route with file upload support
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { username, title, content, imageUrl } = req.body;

    if (!username || !title || !content) {
      return res
        .status(400)
        .json({ error: "Username, title, and content required" });
    }

    let finalImageUrl = imageUrl || "/img/post.png";

    // If a file was uploaded, upload it to S3
    if (req.file) {
      const { buffer, mimetype, originalname } = req.file;
      const { url } = await uploadToS3({
        buffer,
        mimeType: mimetype,
        originalName: originalname,
      });
      finalImageUrl = url;
    }

    const db = getDB();
    const result = await db.collection("posts").insertOne({
      username,
      title,
      content,
      imageUrl: finalImageUrl,
      likeCount: 0,
      likedBy: [],
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

// Like post route
router.post("/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = getDB();

    // Build query to find post
    let query;
    try {
      if (ObjectId.isValid(postId) && postId.length === 24) {
        query = { $or: [{ postId: postId }, { _id: new ObjectId(postId) }] };
      } else {
        query = { $or: [{ postId: postId }, { _id: postId }] };
      }
    } catch (e) {
      query = { $or: [{ postId: postId }, { _id: postId }] };
    }

    const post = await db.collection("posts").findOne(query);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Initialize likedBy array if it doesn't exist
    const likedBy = post.likedBy || [];

    // Check if user already liked the post
    if (likedBy.includes(username)) {
      return res.status(400).json({ error: "Post already liked by this user" });
    }

    // Add username to likedBy array and increment likeCount
    const result = await db.collection("posts").updateOne(query, {
      $push: { likedBy: username },
      $inc: { likeCount: 1 },
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Return updated post
    const updatedPost = await db.collection("posts").findOne(query);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// Unlike post route
router.post("/:postId/unlike", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = getDB();

    // Build query to find post
    let query;
    try {
      if (ObjectId.isValid(postId) && postId.length === 24) {
        query = { $or: [{ postId: postId }, { _id: new ObjectId(postId) }] };
      } else {
        query = { $or: [{ postId: postId }, { _id: postId }] };
      }
    } catch (e) {
      query = { $or: [{ postId: postId }, { _id: postId }] };
    }

    const post = await db.collection("posts").findOne(query);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likedBy = post.likedBy || [];

    // Check if user hasn't liked the post
    if (!likedBy.includes(username)) {
      return res.status(400).json({ error: "Post not liked by this user" });
    }

    // Remove username from likedBy array and decrement likeCount
    const result = await db.collection("posts").updateOne(query, {
      $pull: { likedBy: username },
      $inc: { likeCount: -1 },
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Return updated post
    const updatedPost = await db.collection("posts").findOne(query);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({ error: "Failed to unlike post" });
  }
});

// Add comment route
router.post("/:postId/comment", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({ error: "Username and text required" });
    }

    const db = getDB();

    // Build query to find post
    let query;
    try {
      if (ObjectId.isValid(postId) && postId.length === 24) {
        query = { $or: [{ postId: postId }, { _id: new ObjectId(postId) }] };
      } else {
        query = { $or: [{ postId: postId }, { _id: postId }] };
      }
    } catch (e) {
      query = { $or: [{ postId: postId }, { _id: postId }] };
    }

    const post = await db.collection("posts").findOne(query);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Initialize comments array if it doesn't exist
    const comments = post.comments || [];

    // Add new comment
    const newComment = {
      username,
      text: text.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection("posts").updateOne(query, {
      $push: { comments: newComment },
    });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Return updated post
    const updatedPost = await db.collection("posts").findOne(query);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete post route
router.delete("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.query; // Get username from query to verify ownership

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const db = getDB();

    // Build query to find post by postId or _id
    // Try to convert to ObjectId if it looks like a MongoDB ObjectId
    let query;
    try {
      // Try as ObjectId first
      if (ObjectId.isValid(postId) && postId.length === 24) {
        query = { $or: [{ postId: postId }, { _id: new ObjectId(postId) }] };
      } else {
        query = { $or: [{ postId: postId }, { _id: postId }] };
      }
    } catch (e) {
      query = { $or: [{ postId: postId }, { _id: postId }] };
    }

    // Find the post first to verify ownership
    const post = await db.collection("posts").findOne(query);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Verify that the user owns the post
    if (post.username !== username) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You can only delete your own posts" });
    }

    // Delete the post using the same query
    const result = await db.collection("posts").deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
