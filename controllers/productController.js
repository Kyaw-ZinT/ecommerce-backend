// backend/controllers/productController.js

import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8; // တစ်မျက်နှာမှာ ပြသမယ့် ကုန်ပစ္စည်းအရေအတွက်
  const page = Number(req.query.pageNumber) || 1; // Query param ကနေ pageNumber ကို ယူမယ် (မရှိရင် 1)

  // Search Keyword (name, description မှာ ရှာမယ်)
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i", // Case-insensitive
        },
      }
    : {};

  // Category Filter
  const category = req.query.category
    ? {
        category: req.query.category,
      }
    : {};

  // Price Range Filter (minPrice, maxPrice)
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || Infinity; // Max price မရှိရင် Infinity

  const priceFilter = {
    price: {
      $gte: minPrice, // Greater than or equal to minPrice
      $lte: maxPrice, // Less than or equal to maxPrice
    },
  };

  // Combine all filters
  const filters = { ...keyword, ...category, ...priceFilter };

  // Total count of products matching filters
  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .limit(pageSize) // တစ်မျက်နှာမှာ ပြသမယ့် အရေအတွက်ကို ကန့်သတ်မယ်
    .skip(pageSize * (page - 1)); // ရှောင်ရှားမယ့် Product အရေအတွက် (ဘယ် page ကစပြမလဲ)

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404); // Not Found
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // ယာယီ Product Data တွေနဲ့ Default Product တစ်ခု ဖန်တီးမယ်
  const product = new Product({
    name: "Sample Name",
    price: 0,
    user: req.user._id, // Login ဝင်ထားတဲ့ Admin User ID ကို ထည့်မယ်
    image: "/images/sample.jpg", // Default image
    brand: "Sample Brand",
    category: "Sample Category",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct); // 201 Created
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404); // Not Found
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id }); // Mongoose 6+ မှာ deleteOne ကို သုံးပါ
    res.json({ message: "Product removed" });
  } else {
    res.status(404); // Not Found
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    // Review ရေးမယ့် User ဟာ အရင်က ဒီ Product ကို Review ရေးပြီးပြီလား စစ်ဆေးခြင်း
    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());

    if (alreadyReviewed) {
      res.status(400); // Bad Request
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review); // Review အသစ်ကို Product ရဲ့ reviews array ထဲ ထည့်မယ်

    product.numReviews = product.reviews.length; // reviews အရေအတွက်ကို update လုပ်မယ်

    // Average Rating ကို တွက်ချက်ခြင်း
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save(); // Product ကို Database မှာ Save လုပ်မယ်
    res.status(201).json({ message: "Review added" }); // 201 Created
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview };
