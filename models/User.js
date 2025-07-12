// backend/models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Password ကို hash လုပ်ဖို့

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email က တစ်မူထူးခြားရမယ် (duplicate မရှိရ)
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false, // Default အားဖြင့် Admin မဟုတ်ဘူး
    },
  },
  {
    timestamps: true, // created_at နဲ့ updated_at field တွေ အလိုအလျောက် ထည့်ပေးမယ်
  }
);

// Password ကို Database မှာ မသိမ်းခင် Hash လုပ်ဖို့ Pre-save Middleware
userSchema.pre("save", async function (next) {
  // Password ကို ပြောင်းလဲမှ (သို့) အသစ်ထည့်မှ Hash လုပ်မယ်
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10); // Salt ကို generate လုပ်မယ် (10 rounds)
  this.password = await bcrypt.hash(this.password, salt); // Password ကို Hash လုပ်မယ်
});

// Login လုပ်တဲ့အခါ Password ကို တိုက်စစ်ဖို့ Method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Entered Password နဲ့ Database က Hash Password ကို တိုက်စစ်မယ်
};

const User = mongoose.model("User", userSchema);

export default User;
