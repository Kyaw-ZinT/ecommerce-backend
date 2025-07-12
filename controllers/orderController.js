// backend/controllers/orderController.js

import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Stripe from "stripe"; // Stripe ကို import လုပ်ပါ
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Stripe Instance ကို ဖန်တီးပါ

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        // orderItems တွေက Product ID ပဲသိမ်းပြီး Product Details မသိမ်းရအောင် map လုပ်
        ...x,
        product: x._id, // product._id ကို product field အဖြစ် ထည့်ပါ
        _id: undefined, // _id ကို ဖယ်ရှား (database ကနေ auto generate လုပ်မှာမို့)
      })),
      user: req.user._id, // Auth Middleware ကနေ ရလာတဲ့ user ID
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email"); // Order ရဲ့ User အချက်အလက်ကိုပါ ဆွဲယူမယ်

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    // Stripe Payment Result ကို ဒီနေရာမှာ သိမ်းနိုင်ပါတယ်
    // req.body မှာ Stripe Payment Intent ID ဒါမှမဟုတ် Charge ID တွေ ပါလာရင် သိမ်းပါ
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time, // Stripe မှ update_time
      email_address: req.body.payer_email, // Stripe မှ payer_email
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Create Stripe Payment Intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe က Cent နဲ့ ယူတာမို့ 100 နဲ့ မြှောက်ပါ
      currency: "usd", // Currency ကို သတ်မှတ်ပါ
      metadata: { integration_check: "accept_a_payment" }, // Optional metadata
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Stripe error: ${error.message}`);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name"); // User ID နဲ့ Name ကိုပါ ဆွဲယူမယ်
  res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  createPaymentIntent,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
};
