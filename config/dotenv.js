// backend/config/dotenv.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name using import.meta.url for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv with the explicit path to your .env file
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Optional: Log to confirm it's loading
// console.log("Dotenv loaded from config/dotenv.js");
// console.log("Stripe Secret Key from dotenv.js:", process.env.STRIPE_SECRET_KEY ? "Yes" : "No");

// You don't need to export anything from this file.
// Its sole purpose is to ensure dotenv.config() runs.
