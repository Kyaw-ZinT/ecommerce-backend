// backend/routes/uploadRoutes.js

import express from "express";
import multer from "multer"; // multer ကို import လုပ်ပါ
import path from "path"; // Node.js built-in path module ကို import လုပ်ပါ

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Upload လုပ်မယ့် ပုံတွေကို 'uploads/' folder ထဲ သိမ်းမယ်
  },
  filename(req, file, cb) {
    // ပုံနာမည်ကို fieldname-timestamp.extension ပုံစံမျိုးနဲ့ သိမ်းမယ်
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File Filter (JPEG, JPG, PNG ပဲ ခွင့်ပြုမယ်)
function checkFileType(file, cb) {
  const filetypes = /jpe?g|png|webp/; // ခွင့်ပြုမယ့် file types တွေ
  const mimetype = filetypes.test(file.mimetype); // mime type ကို စစ်ဆေး
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // extension ကို စစ်ဆေး

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Images Only!"); // Image မဟုတ်ရင် Error ပြပါ
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Upload Route (single image upload)
router.post("/", upload.single("image"), (req, res) => {
  // Upload အောင်မြင်ရင် ပုံရဲ့ path ကို Client ဘက်ကို ပြန်ပို့မယ်
  // ဥပမာ: /uploads/image-1678888888888.jpeg
  res.send(`/${req.file.path}`);
});

export default router;
