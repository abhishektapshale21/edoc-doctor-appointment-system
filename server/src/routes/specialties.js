import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const list = await db.specialties.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch specialties" });
  }
});

export default router;
