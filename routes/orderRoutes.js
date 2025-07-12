// backend/routes/orderRoutes.js

import express from "express";
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  createPaymentIntent,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// POST /api/orders (Create New Order)
// GET /api/orders (Get All Orders - Admin Only)
router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

// GET /api/orders/myorders (Get My Orders - User Specific)
router.route("/myorders").get(protect, getMyOrders);

// POST /api/orders/create-payment-intent (Create Stripe Payment Intent)
router.post("/create-payment-intent", protect, createPaymentIntent);

// GET /api/orders/:id (Get Single Order by ID)
// PUT /api/orders/:id/pay (Update Order to Paid)
router.route("/:id").get(protect, getOrderById);
router.route("/:id/pay").put(protect, updateOrderToPaid);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);
export default router;
