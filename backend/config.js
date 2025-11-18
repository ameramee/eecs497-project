// config.js - Load environment variables before anything else
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
dotenv.config({ path: join(__dirname, ".env.local") });
// Also try .env as fallback
dotenv.config({ path: join(__dirname, ".env") });

// Export nothing, this file is just for side effects
