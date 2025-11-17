import { MongoClient } from "mongodb";
import { setDefaultResultOrder } from "dns";

// Workaround for Node.js 22 DNS/TLS issues
setDefaultResultOrder("ipv4first");

const uri =
  "mongodb+srv://ameer:eecs497@gather.pzfvgew.mongodb.net/myReactAppDB?retryWrites=true&w=majority&appName=Gather";

const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  // Node.js 22 compatibility
  directConnection: false,
};

const client = new MongoClient(uri, options);

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db("myReactAppDB");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

export function getDB() {
  if (!db) throw new Error("Database not connected!");
  return db;
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
