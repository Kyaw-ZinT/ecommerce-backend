// backend/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Header ထဲမှာ Authorization (Bearer Token) ရှိမရှိ စစ်ဆေးခြင်း
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Token ကို "Bearer <token>" ထဲကနေ ထုတ်ယူခြင်း
      token = req.headers.authorization.split(" ")[1];

      // Token ကို Verify လုပ်ခြင်း (secret key နဲ့ စစ်)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ID နဲ့ Database က User ကို ရှာဖွေပြီး Request object ထဲကို ထည့်ပေးခြင်း
      // Password ကလွဲပြီး ကျန်တဲ့ အချက်အလက်တွေ
      req.user = await User.findById(decoded.id).select("-password");

      next(); // နောက်ထပ် Middleware ဒါမှမဟုတ် Route Handler ကို ဆက်သွားခွင့်ပြုခြင်း
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401); // Unauthorized
    throw new Error("Not authorized, no token");
  }
});

// User က Admin ဟုတ်မဟုတ် စစ်ဆေးခြင်း
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Admin ဖြစ်ရင် ဆက်သွားခွင့်ပြု
  } else {
    res.status(401); // Unauthorized
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };
