import express from "express";
import Task from "../models/Task.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// 🔐 GET /api/tasks - Fetch tasks for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ owner: req.user.email }, { sharedWith: req.user.email }],
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

// 🔐 POST /api/tasks - Create a task
router.post("/", verifyToken, async (req, res) => {
  const { title, status, priority, sharedWith, dueDate, tags } = req.body;

  console.log("Received task:", req.body);

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const task = await Task.create({
      title,
      status: status || "pending",
      priority: priority || "medium",
      dueDate,
      tags,
      owner: req.user.email,
      sharedWith: sharedWith || [],
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Error creating task" });
  }
});

// 🔐 PUT /api/tasks/:id - Update task (title, status, priority, dueDate, tags)
router.put("/:id", verifyToken, async (req, res) => {
  const { title, status, priority, dueDate, tags } = req.body;

  if (!title && !status && !priority && !dueDate && !tags) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, status, priority, dueDate, tags },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// 🔐 DELETE /api/tasks/:id - Delete task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting task" });
  }
});

export default router;
