import { MongoClient } from "mongodb";

const uri = "mongodb+srv://ameer:eecs497@gather.pzfvgew.mongodb.net/?appName=Gather";

const options = {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const client = new MongoClient(uri, options);

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

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});