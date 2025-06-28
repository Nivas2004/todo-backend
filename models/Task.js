import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "done"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: Date,
    },

    tags: {
      type: [String],
      default: [],
    },

    owner: {
      type: String,
      required: true, // keeps your original validation
    },

    sharedWith: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
