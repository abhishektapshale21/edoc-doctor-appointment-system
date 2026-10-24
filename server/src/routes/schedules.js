import express from "express";
import { db } from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/schedules
router.get("/", async (req, res) => {
  try {
    const { docId, date, q } = req.query;
    let schedules = await db.schedules.find();

    if (docId) {
      schedules = schedules.filter(s => s.docId === docId);
    }
    if (date) {
      schedules = schedules.filter(s => s.sessionDate === date);
    }
    if (q) {
      const term = q.toLowerCase();
      schedules = schedules.filter(
        s =>
          s.title?.toLowerCase().includes(term) ||
          s.docName?.toLowerCase().includes(term) ||
          s.specialtyName?.toLowerCase().includes(term)
      );
    }

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// GET /api/schedules/:id
router.get("/:id", async (req, res) => {
  try {
    const session = await db.schedules.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Schedule session not found" });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule session" });
  }
});

// POST /api/schedules (Admin or Doctor)
router.post("/", authenticate, authorize("admin", "doctor"), async (req, res) => {
  try {
    let { docId, title, sessionDate, sessionTime, maxAppointments } = req.body;

    // If caller is doctor, force docId to be themselves
    if (req.user.role === "doctor") {
      docId = req.user.id || req.user._id;
    }

    if (!docId || !title || !sessionDate || !sessionTime) {
      return res.status(400).json({ error: "Doctor, title, date, and time are required" });
    }

    const doctor = await db.users.findById(docId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(400).json({ error: "Selected doctor does not exist" });
    }

    const newSchedule = await db.schedules.create({
      docId,
      docName: doctor.name,
      specialtyName: doctor.specialtyName || "General Practice",
      title,
      sessionDate,
      sessionTime,
      maxAppointments: Number(maxAppointments) || 20,
      bookedCount: 0
    });

    res.status(201).json(newSchedule);
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Failed to create schedule session" });
  }
});

// DELETE /api/schedules/:id
router.delete("/:id", authenticate, authorize("admin", "doctor"), async (req, res) => {
  try {
    const { id } = req.params;
    const session = await db.schedules.findById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (req.user.role === "doctor" && session.docId !== req.user.id && session.docId !== req.user._id) {
      return res.status(403).json({ error: "Unauthorized to delete this session" });
    }

    await db.schedules.findByIdAndDelete(id);
    res.json({ message: "Schedule session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete schedule session" });
  }
});

export default router;
