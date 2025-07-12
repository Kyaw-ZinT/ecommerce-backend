// backend/utils/generateToken.js

import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token သက်တမ်းကို ၃၀ ရက် သတ်မှတ်မယ်
  });
};

export default generateToken;
