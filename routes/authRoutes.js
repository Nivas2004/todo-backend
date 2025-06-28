import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔐 POST /api/auth/google
router.post("/google", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email" });
  }

  // ✅ Generate JWT token
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 🧾 Return user data + token
  res.json({
    user: { name, email },
    token,
  });
});

export default router;
