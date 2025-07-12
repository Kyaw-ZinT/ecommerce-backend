// backend/models/Product.js

import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // User Model ကို ကိုးကားခြင်း (ဘယ်သူ review ရေးတယ်ဆိုတာ သိရအောင်)
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Product ကို ဘယ် Admin က ထည့်တယ်ဆိုတာ သိရအောင်
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      // Single Image အတွက်
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema], // Product Review တွေအတွက် array of reviewSchema
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      // review အရေအတွက်
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      // ကုန်ပစ္စည်းလက်ကျန်
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
