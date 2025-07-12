// 1. Import your dotenv configuration file FIRST.
import "./config/dotenv.js"; // This ensures dotenv.config() runs immediately

// 2. Now import all other modules.
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import path from "path"; // Still needed for static files serving below

// Database connection (ensure it's called after dotenv.config() has run via the import above)
connectDB();

const app = express();

app.use(express.json());
// CORS Configuration (should be next)
const allowedOrigins = [
  "http://localhost:5173", // Frontend Local Development URL
  "https://e-commerce-iota-beryl-83.vercel.app", // Your Vercel Frontend Domain URL
  "https://ecommerce-iota-jade.vercel.app", // If you have previous domains
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        console.log(`CORS blocked for origin: ${origin}. Not in allowedOrigins.`);
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// 3. Define a simple test route for the root URL
//    (Optional, but useful for quick health checks)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 4. API Routes (MUST BE BEFORE ANY 404 HANDLER)
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// 5. Static folder for uploaded images (MUST BE BEFORE ANY 404 HANDLER)
const __dirname_manual = path.dirname(new URL(import.meta.url).pathname); // Re-calculate __dirname for static
app.use("/uploads", express.static(path.join(__dirname_manual, "/uploads")));

// 6. Error Handling Middleware (MUST BE AT THE VERY END, AFTER ALL ROUTES & STATIC FILES)

// 404 Not Found Error Handler (This catches any request that didn't match a route above)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General Error Handler (This catches any other unhandled errors in your application)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Debugging: Verify Stripe Secret Key loading
  // You can keep this log for verification.
});
