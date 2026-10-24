import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Clock,
  Users,
  Activity,
  Plus,
  Trash2,
  CheckCircle,
  Stethoscope,
  Settings,
  Search,
  Lock,
  UserCheck
} from "lucide-react";

export default function DoctorDashboard() {
  const { user, showToast, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    sessionDate: "",
    sessionTime: "10:00",
    maxAppointments: 20
  });

  // Doctor Settings State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    specialtyId: user?.specialtyId || 1,
    password: ""
  });

  const loadData = async () => {
    try {
      const [sData, schedData, apptData, specData] = await Promise.all([
        api.getStats(),
        api.getSchedules({ docId: user.id || user._id }),
        api.getAppointments(),
        api.getSpecialties()
      ]);
      setStats(sData);
      setSchedules(schedData);
      setAppointments(apptData);
      setSpecialties(specData);
      setProfileData({
        name: user?.name || "",
        phone: user?.phone || "",
        specialtyId: user?.specialtyId || 1,
        password: ""
      });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await api.createSchedule({
        ...newSession,
        docId: user.id || user._id
      });
      showToast("Consultation session added to schedule!");
      setShowAddSessionModal(false);
      setNewSession({
        title: "",
        sessionDate: "",
        sessionTime: "10:00",
        maxAppointments: 20
      });
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Cancel and delete this session?")) return;
    try {
      await api.deleteSchedule(id);
      showToast("Session cancelled");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Cancel this patient appointment?")) return;
    try {
      await api.cancelAppointment(id);
      showToast("Appointment cancelled");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateDoctor(user.id || user._id, profileData);
      updateUserProfile(updated);
      showToast("Doctor profile updated successfully!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Doctor Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-role-indicator">
            <Stethoscope size={16} color="#0d9488" />
            <span>Doctor Practice Suite</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            type="button"
            className={`nav-tab-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Activity size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "schedules" ? "active" : ""}`}
            onClick={() => setActiveTab("schedules")}
          >
            <Calendar size={18} />
            <span>My Sessions</span>
            <span className="tab-count">{schedules.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <Clock size={18} />
            <span>My Appointments</span>
            <span className="tab-count">{appointments.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
            <span>Profile Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>Welcome back, {user?.name}</h2>
                <p className="sub-text">Specialty: {user?.specialtyName || "Medical Practitioner"}</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddSessionModal(true)}
              >
                <Plus size={16} /> Schedule Session
              </button>
            </div>

            {/* Metrics */}
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("appointments")}>
                <div className="stat-icon-wrapper stat-indigo">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">My Appointments</span>
                  <span className="stat-number">{appointments.length}</span>
                  <span className="stat-link">View appointment queue →</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("schedules")}>
                <div className="stat-icon-wrapper stat-emerald">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Scheduled Sessions</span>
                  <span className="stat-number">{schedules.length}</span>
                  <span className="stat-link">Manage sessions →</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper stat-teal">
                  <UserCheck size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Patient Consultations</span>
                  <span className="stat-number">{stats?.myPatientsCount || appointments.length}</span>
                  <span className="stat-link">Total patients registered</span>
                </div>
              </div>
            </div>

            {/* Appointments Queue */}
            <div className="section-card">
              <div className="section-card-header">
                <h3>My Upcoming Patient Consultations</h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab("appointments")}
                >
                  View All ({appointments.length})
                </button>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient Name</th>
                      <th>Contact</th>
                      <th>Session Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-cell">
                          No patients currently in your appointment queue.
                        </td>
                      </tr>
                    ) : (
                      appointments.slice(0, 5).map((appt) => (
                        <tr key={appt.id || appt._id}>
                          <td>
                            <span className="badge badge-primary">#{appt.appointmentNumber}</span>
                          </td>
                          <td>
                            <strong>{appt.patientName}</strong>
                          </td>
                          <td>{appt.patientPhone || appt.patientEmail}</td>
                          <td>
                            {appt.sessionDate} at {appt.sessionTime}
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {appt.status || "Confirmed"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SESSIONS */}
        {activeTab === "schedules" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>My Clinical Consultation Sessions</h2>
                <p className="sub-text">Add and manage session times and available booking slots</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddSessionModal(true)}
              >
                <Plus size={16} /> New Session
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Booked / Max Slots</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-cell">
                        You have not scheduled any consultation sessions yet.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((s) => (
                      <tr key={s.id || s._id}>
                        <td>
                          <strong>{s.title}</strong>
                        </td>
                        <td>{s.sessionDate}</td>
                        <td>{s.sessionTime}</td>
                        <td>
                          <span className="badge badge-primary">
                            {s.bookedCount || 0} / {s.maxAppointments || 20} slots
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Cancel Session"
                            onClick={() => handleDeleteSession(s.id || s._id)}
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MY APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>My Booked Consultations</h2>
                <p className="sub-text">Patients queued for your clinical sessions</p>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Patient Name</th>
                    <th>Session Title</th>
                    <th>Date & Time</th>
                    <th>Phone / Email</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No appointments booked for your sessions yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id || appt._id}>
                        <td>
                          <span className="badge badge-primary">#{appt.appointmentNumber}</span>
                        </td>
                        <td>
                          <strong>{appt.patientName}</strong>
                        </td>
                        <td>{appt.scheduleTitle || "General Consultation"}</td>
                        <td>
                          {appt.sessionDate} at {appt.sessionTime}
                        </td>
                        <td>
                          <div>{appt.patientPhone || "—"}</div>
                          <div className="cell-sub">{appt.patientEmail}</div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelAppointment(appt.id || appt._id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>Doctor Profile Settings</h2>
                <p className="sub-text">Update your practitioner information and credentials</p>
              </div>
            </div>

            <div className="section-card" style={{ maxWidth: "600px" }}>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialty</label>
                  <select
                    className="form-control"
                    value={profileData.specialtyId}
                    onChange={(e) =>
                      setProfileData({ ...profileData, specialtyId: Number(e.target.value) })
                    }
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.sname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Change Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    placeholder="New password"
                    className="form-control"
                    value={profileData.password}
                    onChange={(e) =>
                      setProfileData({ ...profileData, password: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "12px" }}>
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD DOCTOR SESSION */}
        {showAddSessionModal && (
          <div className="modal-overlay" onClick={() => setShowAddSessionModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Schedule New Consultation Session</h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setShowAddSessionModal(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddSession}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Session Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Morning OPD / Heart Evaluation"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newSession.sessionDate}
                        onChange={(e) =>
                          setNewSession({ ...newSession, sessionDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={newSession.sessionTime}
                        onChange={(e) =>
                          setNewSession({ ...newSession, sessionTime: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum Patients (Capacity)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control"
                      value={newSession.maxAppointments}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          maxAppointments: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddSessionModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
