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
const allowedOrigins = [
  "http://localhost:5173", // Frontend Local Development URL
  "https://ecommerce-iota-jade.vercel.app", // <-- Vercel က ပေးတဲ့ သင့် Frontend Domain URL
  // နောက်ထပ် Custom Domains တွေ ရှိရင် ဒီနေရာမှာ ထပ်ထည့်နိုင်ပါတယ်
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Connect Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// Serve static folder (uploads)
// Use import.meta.url for ESM compatible __dirname
const __dirname_manual = path.dirname(new URL(import.meta.url).pathname);
app.use("/uploads", express.static(path.join(__dirname_manual, "/uploads")));

// Error Handling Middleware (no changes)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

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
  // Debugging: Verify Stripe Secret Key loading directly from process.env
});
