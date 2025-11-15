import express from "express";
import cors from "cors";
import { connectDB, getDB } from "./db.jsx";

const app = express();
app.use(cors());
app.use(express.json());

let db;

connectDB().then(() => {
  db = getDB();

  // Example: get all posts
  app.get("/api/posts", async (req, res) => {
    const posts = await db.collection("posts").find().toArray();
    res.json(posts);
  });

  // Example: add a post
  app.post("/api/posts", async (req, res) => {
    const newPost = req.body;
    await db.collection("posts").insertOne(newPost);
    res.status(201).json({ message: "Post added!" });
  });

  app.listen(5000, () => console.log("🚀 Server running on port 5000"));
});