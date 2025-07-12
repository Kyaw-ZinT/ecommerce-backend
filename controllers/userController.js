// backend/controllers/userController.js

import asyncHandler from "express-async-handler"; // Express-async-handler ကို install လုပ်ရန် (Error ကို အလိုအလျောက် ကိုင်တွယ်ဖို့)
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password, // Password က Model မှာ Hash လုပ်ပြီးသား ဖြစ်သွားမယ်
  });

  if (user) {
    res.status(201).json({
      // Created
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // JWT Token ထုတ်ပေးခြင်း
    });
  } else {
    res.status(400); // Bad Request
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // User ရှိလား၊ Password မှန်လား စစ်ဆေးခြင်း
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // JWT Token ထုတ်ပေးခြင်း
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Invalid email or password");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// ဘာကြောင့်၊ ဘာအတွက် သုံးလဲ: Login ဝင်ထားတဲ့ User ရဲ့ အချက်အလက် (Profile) ကို Backend ကနေ ဆွဲယူဖို့အတွက် ဒီ API ကို သုံးပါတယ်။ User ရဲ့ Name, Email, isAdmin status တွေကို ပြသပေးမှာပါ။ Private Route ဖြစ်လို့ Token ပါမှ ခွင့်ပြုပါမယ်။
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id); // protect middleware ကနေ req.user ကို ရယူ

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// / @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// ဘာကြောင့်၊ ဘာအတွက် သုံးလဲ: Login ဝင်ထားတဲ့ User ရဲ့ Profile အချက်အလက်တွေကို ပြင်ဆင်ဖို့အတွက် ဒီ API ကို သုံးပါတယ်။ User က သူ့ရဲ့ Name, Email, Password တွေကို ပြောင်းလဲနိုင်ပါတယ်။ Password ကို ပြောင်းလဲရင် Hash ပြန်လုပ်ပေးဖို့ လိုပါတယ်။ Private Route ဖြစ်လို့ Token ပါမှ ခွင့်ပြုပါမယ်။
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name; // Name ပြင်ချင်မှ ပြင်၊ မပြင်ရင် မူရင်းအတိုင်း
    user.email = req.body.email || user.email; // Email ပြင်ချင်မှ ပြင်

    if (req.body.password) {
      user.password = req.body.password; // Password ကို ပြင်ဆင်ရင် Model မှာ Hash လုပ်ပေးထားပါတယ်။
    }

    const updatedUser = await user.save(); // Database မှာ Save လုပ်

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id), // Token အသစ်ထုတ်ပေးခြင်း (အချက်အလက်ပြောင်းလဲသွားလို့)
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}); // User အားလုံးကို ရှာမယ်
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Admin ကို ကိုယ်တိုင် ဖျက်ခွင့်မပြုခြင်း (Optional)
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await User.deleteOne({ _id: user._id }); // User ကို ဖျက်ပစ်မယ်
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  // Password မပါဝင်အောင် select('-password')
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // req.body.isAdmin သည် Boolean ဖြစ်ရမည် (Frontend ကနေ true/false တိုက်ရိုက်ပို့ပါ)
    user.isAdmin = req.body.isAdmin; // Admin status ကို တိုက်ရိုက် update လုပ်

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export { registerUser, authUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser };
