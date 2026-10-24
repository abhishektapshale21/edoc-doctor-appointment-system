import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import AppointmentSlipModal from "../AppointmentSlipModal";
import {
  Calendar,
  Clock,
  Search,
  User,
  Stethoscope,
  Activity,
  Printer,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  Settings,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function PatientDashboard() {
  const { user, showToast, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [docSearch, setDocSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");

  // Booking Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [slipAppointment, setSlipAppointment] = useState(null);

  // Patient Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    nic: user?.nic || "",
    dob: user?.dob || "",
    password: ""
  });

  const loadData = async () => {
    try {
      const [dData, specData, schedData, apptData] = await Promise.all([
        api.getDoctors(),
        api.getSpecialties(),
        api.getSchedules(),
        api.getAppointments()
      ]);
      setDoctors(dData);
      setSpecialties(specData);
      setSchedules(schedData);
      setMyBookings(apptData);
      setProfileData({
        name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        nic: user?.nic || "",
        dob: user?.dob || "",
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

  // Handle booking appointment
  const handleConfirmBooking = async () => {
    if (!selectedSession) return;
    try {
      const newAppt = await api.bookAppointment(selectedSession.id || selectedSession._id);
      showToast(`Appointment booked successfully! Your Token is #${newAppt.appointmentNumber}`);
      setSelectedSession(null);
      await loadData();
      // Show printable slip modal immediately
      setSlipAppointment(newAppt);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.cancelAppointment(id);
      showToast("Appointment cancelled successfully");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updatePatient(user.id || user._id, profileData);
      updateUserProfile(updated);
      showToast("Profile details updated successfully!");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Filtered lists
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name?.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.specialtyName?.toLowerCase().includes(docSearch.toLowerCase());
    const matchesSpec = specialtyFilter
      ? String(doc.specialtyId) === String(specialtyFilter)
      : true;
    return matchesSearch && matchesSpec;
  });

  const filteredSchedules = schedules.filter((s) => {
    const term = sessionSearch.toLowerCase();
    return (
      s.title?.toLowerCase().includes(term) ||
      s.docName?.toLowerCase().includes(term) ||
      s.specialtyName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="dashboard-layout">
      {/* Patient Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-role-indicator">
            <User size={16} color="#0284c7" />
            <span>Patient Portal</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            type="button"
            className={`nav-tab-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <Clock size={18} />
            <span>My Bookings</span>
            <span className="tab-count">{myBookings.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "schedules" ? "active" : ""}`}
            onClick={() => setActiveTab("schedules")}
          >
            <Calendar size={18} />
            <span>Scheduled Sessions</span>
            <span className="tab-count">{schedules.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            <Stethoscope size={18} />
            <span>All Doctors</span>
            <span className="tab-count">{doctors.length}</span>
          </button>

          <button
            type="button"
            className={`nav-tab-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={18} />
            <span>My Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>Hello, {user?.name}</h2>
                <p className="sub-text">Need to consult a doctor? Search and book available sessions below.</p>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab("schedules")}
                >
                  <Calendar size={16} /> Book Appointment
                </button>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("bookings")}>
                <div className="stat-icon-wrapper stat-indigo">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Active Bookings</span>
                  <span className="stat-number">{myBookings.length}</span>
                  <span className="stat-link">View appointment slips →</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("schedules")}>
                <div className="stat-icon-wrapper stat-emerald">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Available Sessions</span>
                  <span className="stat-number">{schedules.length}</span>
                  <span className="stat-link">Browse open clinical slots →</span>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("doctors")}>
                <div className="stat-icon-wrapper stat-blue">
                  <Stethoscope size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Consultant Doctors</span>
                  <span className="stat-number">{doctors.length}</span>
                  <span className="stat-link">Browse specialists →</span>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings or Quick Booking CTA */}
            {myBookings.length > 0 ? (
              <div className="section-card">
                <div className="section-card-header">
                  <h3>Your Upcoming Appointments</h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab("bookings")}
                  >
                    View All Bookings ({myBookings.length})
                  </button>
                </div>

                <div className="booking-cards-grid">
                  {myBookings.slice(0, 3).map((appt) => (
                    <div key={appt.id || appt._id} className="patient-appt-card">
                      <div className="appt-card-top">
                        <span className="token-pill">Token #{appt.appointmentNumber}</span>
                        <span className="badge badge-success">Confirmed</span>
                      </div>
                      <h4 className="appt-doc-name">{appt.docName}</h4>
                      <p className="appt-session-title">{appt.scheduleTitle}</p>
                      <div className="appt-time-info">
                        <Calendar size={14} /> {appt.sessionDate} • <Clock size={14} /> {appt.sessionTime}
                      </div>
                      <div className="appt-card-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSlipAppointment(appt)}
                        >
                          <Printer size={14} /> View Slip
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelBooking(appt.id || appt._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="welcome-banner">
                <div className="welcome-banner-content">
                  <h3>Ready to schedule your next check-up?</h3>
                  <p>Browse specialists and pick a date that suits your calendar in seconds.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveTab("schedules")}
                  >
                    Explore Available Sessions <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>My Booked Consultations</h2>
                <p className="sub-text">View your reservation tokens and download printable appointment passes</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab("schedules")}
              >
                <Calendar size={16} /> Book Another Session
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Doctor Name</th>
                    <th>Session Title</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        You have not made any bookings yet.{" "}
                        <a href="#schedules" onClick={() => setActiveTab("schedules")}>
                          Book your first appointment now!
                        </a>
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((appt) => (
                      <tr key={appt.id || appt._id}>
                        <td>
                          <span className="badge badge-primary">#{appt.appointmentNumber}</span>
                        </td>
                        <td>
                          <strong>{appt.docName}</strong>
                        </td>
                        <td>{appt.scheduleTitle || "General Consultation"}</td>
                        <td>
                          {appt.sessionDate} at {appt.sessionTime}
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {appt.status || "Confirmed"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSlipAppointment(appt)}
                            style={{ marginRight: "8px" }}
                          >
                            <Printer size={14} /> Slip
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelBooking(appt.id || appt._id)}
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

        {/* TAB 3: SCHEDULES & SESSIONS */}
        {activeTab === "schedules" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>Available Clinical Sessions</h2>
                <p className="sub-text">Choose a session to book your numbered consultation token</p>
              </div>
            </div>

            <div className="filter-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search sessions by title, doctor, or specialty..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="sessions-cards-grid">
              {filteredSchedules.length === 0 ? (
                <div className="empty-cell" style={{ gridColumn: "1 / -1", background: "white", padding: "40px", borderRadius: "12px" }}>
                  No sessions match your search.
                </div>
              ) : (
                filteredSchedules.map((s) => {
                  const max = s.maxAppointments || 20;
                  const booked = s.bookedCount || 0;
                  const remaining = Math.max(0, max - booked);
                  const isFull = remaining === 0;

                  return (
                    <div key={s.id || s._id} className="session-card">
                      <div className="session-card-header">
                        <span className="badge badge-primary">{s.specialtyName}</span>
                        <span className={`badge ${isFull ? "badge-danger" : "badge-success"}`}>
                          {isFull ? "Fully Booked" : `${remaining} slots left`}
                        </span>
                      </div>

                      <h3 className="session-card-title">{s.title}</h3>
                      <div className="session-card-doctor">
                        <Stethoscope size={16} /> {s.docName}
                      </div>

                      <div className="session-card-meta">
                        <div className="meta-pill">
                          <Calendar size={14} /> {s.sessionDate}
                        </div>
                        <div className="meta-pill">
                          <Clock size={14} /> {s.sessionTime}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary session-book-btn"
                        disabled={isFull}
                        onClick={() => setSelectedSession(s)}
                      >
                        {isFull ? "Full" : "Book Token Now"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ALL DOCTORS */}
        {activeTab === "doctors" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>Find Specialist Doctors</h2>
                <p className="sub-text">Filter across 56 medical specialties</p>
              </div>
            </div>

            <div className="filter-bar">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search doctor by name or specialty..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="form-control"
                />
              </div>

              <select
                className="form-control filter-select"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sname}
                  </option>
                ))}
              </select>
            </div>

            <div className="doctors-grid">
              {filteredDoctors.length === 0 ? (
                <div className="empty-cell" style={{ gridColumn: "1 / -1", background: "white", padding: "40px", borderRadius: "12px" }}>
                  No doctors found matching filters.
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div key={doc.id || doc._id} className="doctor-card">
                    <div className="doctor-avatar">
                      <Stethoscope size={28} color="#0284c7" />
                    </div>
                    <h3 className="doctor-name">{doc.name}</h3>
                    <span className="badge badge-primary" style={{ margin: "8px 0" }}>
                      {doc.specialtyName || "General Practice"}
                    </span>
                    <div className="doctor-contact">
                      <div>Email: {doc.email}</div>
                      <div>Phone: {doc.phone || "—"}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: "16px", width: "100%" }}
                      onClick={() => {
                        setSessionSearch(doc.name);
                        setActiveTab("schedules");
                      }}
                    >
                      View Sessions & Book
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === "settings" && (
          <div className="tab-pane">
            <div className="dashboard-header-bar">
              <div>
                <h2>My Account Profile</h2>
                <p className="sub-text">Manage your personal details and contact preferences</p>
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

                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIC</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.nic}
                      onChange={(e) => setProfileData({ ...profileData, nic: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password (optional)</label>
                  <input
                    type="password"
                    placeholder="Leave empty to keep current password"
                    className="form-control"
                    value={profileData.password}
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "12px" }}>
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRM BOOKING */}
        {selectedSession && (
          <div className="modal-overlay" onClick={() => setSelectedSession(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirm Appointment Booking</h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setSelectedSession(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="booking-summary-box">
                  <div className="summary-title">{selectedSession.title}</div>
                  <div className="summary-doc">
                    <Stethoscope size={16} /> {selectedSession.docName} ({selectedSession.specialtyName})
                  </div>
                  <div className="summary-datetime">
                    <Calendar size={15} /> {selectedSession.sessionDate} at {selectedSession.sessionTime}
                  </div>
                  <div className="summary-token-preview">
                    Your Assigned Token will be:{" "}
                    <strong>#{(selectedSession.bookedCount || 0) + 1}</strong>
                  </div>
                </div>

                <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "14px" }}>
                  By confirming, your consultation slot will be registered in the clinic system
                  and an appointment slip will be generated.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSession(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                >
                  Confirm & Reserve Token
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRINTABLE APPOINTMENT SLIP MODAL */}
        {slipAppointment && (
          <AppointmentSlipModal
            appointment={slipAppointment}
            onClose={() => setSlipAppointment(null)}
          />
        )}
      </main>
    </div>
  );
}
