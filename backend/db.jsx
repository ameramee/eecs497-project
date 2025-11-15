import { MongoClient } from "mongodb";

const uri = "mongodb+srv://ameer:eecs497@gather.pzfvgew.mongodb.net/?appName=Gather";
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db("myReactAppDB");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

export function getDB() {
  if (!db) throw new Error("Database not connected!");
  return db;
}