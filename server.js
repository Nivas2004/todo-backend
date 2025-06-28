import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ✅ Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

// ✅ Updated CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://todo-frontend-ruby-delta.vercel.app",
        "https://todo-frontend-emwvuteju-nivas-projects-03ed492c.vercel.app"
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// ✅ Middleware
app.use(express.json());

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

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
