// backend/routes/productRoutes.js

import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Auth Middleware တွေကို import လုပ်ခြင်း

// GET /api/products (အကုန်လုံးယူ)
// POST /api/products (အသစ်ထည့်) - Admin Only
router.route("/").get(getProducts).post(protect, admin, createProduct);

// GET /api/products/:id (တစ်ခုတည်းယူ)
// PUT /api/products/:id (ပြင်ဆင်) - Admin Only
// DELETE /api/products/:id (ဖျက်) - Admin Only
router.route("/:id").get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

// POST /api/products/:id/reviews (Review ထည့်) - Private
router.route("/:id/reviews").post(protect, createProductReview);
export default router;
