import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import admin from "firebase-admin";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js"; // your main task routes

// ✅ ENV config
dotenv.config();

const app = express();

// ✅ CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://todo-frontend-nyyjdpgbq-nivas-projects-03ed492c.vercel.app",
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
    credentials: true,
  })
);

// ✅ JSON parsing middleware
app.use(express.json());

// ✅ Firebase Admin SDK setup
import serviceAccount from "./firebaseServiceAccount.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Firebase token verification middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running!");
});

// ✅ Your existing auth and task routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ (Optional) Sample protected POST /tasks route directly in server.js
app.post("/tasks", verifyToken, (req, res) => {
  const { title } = req.body;
  const userId = req.user.uid;

  const newTask = {
    id: Date.now().toString(),
    title,
    isCompleted: false,
    userId,
  };

  // For now, just return the object. Later, store in MongoDB
  res.status(201).json(newTask);
});

// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
