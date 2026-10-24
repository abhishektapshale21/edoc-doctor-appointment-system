import express from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { role, id } = req.user;
    const doctors = await db.users.find({ role: "doctor" });
    const patients = await db.users.find({ role: "patient" });
    const schedules = await db.schedules.find();
    const appointments = await db.appointments.find();

    const todayStr = new Date().toISOString().split("T")[0];
    const todaySessions = schedules.filter(s => s.sessionDate === todayStr);

    if (role === "admin") {
      return res.json({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        todaySessions: todaySessions.length,
        totalSessions: schedules.length,
        recentAppointments: appointments.slice(0, 5)
      });
    }

    if (role === "doctor") {
      const myAppointments = appointments.filter(a => a.docId === id);
      const mySchedules = schedules.filter(s => s.docId === id);
      const myPatientIds = new Set(myAppointments.map(a => a.patientId));

      return res.json({
        myAppointmentsCount: myAppointments.length,
        mySchedulesCount: mySchedules.length,
        myPatientsCount: myPatientIds.size,
        upcomingAppointments: myAppointments.slice(0, 5)
      });
    }

    // Patient
    const myAppointments = appointments.filter(a => a.patientId === id);
    return res.json({
      myAppointmentsCount: myAppointments.length,
      availableDoctors: doctors.length,
      availableSessions: schedules.length,
      upcomingAppointments: myAppointments.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard metrics" });
  }
});

export default router;
