// backend/config/dotenv.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name using import.meta.url for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv with the explicit path to your .env file
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
