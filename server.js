// // backend/server.js

// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import cors from "cors";
// import userRoutes from "./routes/userRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import uploadRoutes from "./routes/uploadRoutes.js"; // Upload Routes ကို import လုပ်ခြင်း
// import orderRoutes from "./routes/orderRoutes.js";
// import path from "path"; // Node.js built-in path module ကို import လုပ်ပါ
// dotenv.config();
// connectDB();

// const app = express();

// app.use(express.json());
// app.use(
//   cors({
//     origin: "*",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );

// // Routes တွေကို ချိတ်ဆက်ခြင်း
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/orders", orderRoutes);
// // Static folder (uploads) ကို Serve လုပ်ခြင်း
// // __dirname ကို ESM မှာ သုံးလို့မရတဲ့အတွက် path.resolve() ကို သုံးပါ
// const __dirname = path.resolve(); // Current directory path ကို ရယူခြင်း
// app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// // Error Handling Middleware တွေ (အောက်က Code တွေ မပြောင်းလဲပါ)
// app.use((req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// });

// app.use((err, req, res, next) => {
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//   res.status(statusCode);
//   res.json({
//     message: err.message,
//     stack: process.env.NODE_ENV === "production" ? null : err.stack,
//   });
// });

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
//   console.log("Stripe Secret Key Loaded:", process.env.STRIPE_SECRET_KEY);
// });

// backend/server.js

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
app.use(
  cors({
    origin: "*",
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
