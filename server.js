import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import admin from "firebase-admin";

// 🧩 Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

// ✅ CORS Setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://todo-frontend-nyyjdpgbq-nivas-projects-03ed492c.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// ✅ Firebase Admin Initialization (with local secret file)
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebaseServiceAccount.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ✅ Middleware: Verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).send("Invalid token");
  }
};

// ✅ Basic Root Route
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running!");
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ MongoDB Connection + Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
