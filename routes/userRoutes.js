// backend/routes/userRoutes.js

import express from "express";
const router = express.Router();
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// POST /api/users (Register User)
// GET /api/users (Get All Users - Admin Only)
router.route("/").post(registerUser).get(protect, admin, getUsers);

// POST /api/users/login (Authenticate User)
router.post("/login", authUser);

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);
export default router;
