import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  User,
  LogOut,
  Shield,
  Stethoscope,
  LogIn,
  UserPlus,
  RefreshCw
} from "lucide-react";

export default function Navbar({ onOpenAuth, onGoHome }) {
  const { user, logout, demoLogin } = useAuth();

  const handleBrandClick = (e) => {
    e.preventDefault();
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo - Returns to home page */}
        <div
          className="brand"
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          title="eDoc Home - Return to top of home page"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleBrandClick(e);
            }
          }}
        >
          <div className="brand-icon">
            <Activity size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              eDoc<span className="brand-dot">.</span>
            </span>
            <span className="brand-sub">THE E-CHANNELING PROJECT</span>
          </div>
        </div>

        {/* User Status / Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-pill-container">
              {/* Role Quick Switcher when logged in */}
              <div className="role-switch-group">
                <span className="switch-label">Switch:</span>
                {user.role !== "admin" && (
                  <button
                    type="button"
                    className="btn-switch-chip"
                    onClick={() => demoLogin("admin")}
                    title="Switch to Administrator Portal"
                  >
                    <Shield size={12} /> Admin
                  </button>
                )}
                {user.role !== "doctor" && (
                  <button
                    type="button"
                    className="btn-switch-chip"
                    onClick={() => demoLogin("doctor")}
                    title="Switch to Doctor Practice Suite"
                  >
                    <Stethoscope size={12} /> Doctor
                  </button>
                )}
                {user.role !== "patient" && (
                  <button
                    type="button"
                    className="btn-switch-chip"
                    onClick={() => demoLogin("patient")}
                    title="Switch to Patient Portal"
                  >
                    <User size={12} /> Patient
                  </button>
                )}
              </div>

              <div className="user-pill">
                <div className={`role-avatar role-${user.role}`}>
                  {user.role === "admin" ? (
                    <Shield size={14} />
                  ) : user.role === "doctor" ? (
                    <Stethoscope size={14} />
                  ) : (
                    <User size={14} />
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-tag role-tag-${user.role}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign out of current account"
              >
                <LogOut size={15} />
                <span className="btn-text-desktop">Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-unauth-group">
              {/* Demo Quick Logins */}
              <div className="demo-pills-bar">
                <span className="demo-label">Quick Demo:</span>
                <button
                  type="button"
                  className="demo-pill-btn demo-pill-admin"
                  onClick={() => demoLogin("admin")}
                  title="Instant 1-Click Login as Administrator"
                >
                  <Shield size={13} color="#0284c7" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  className="demo-pill-btn demo-pill-doctor"
                  onClick={() => demoLogin("doctor")}
                  title="Instant 1-Click Login as Doctor"
                >
                  <Stethoscope size={13} color="#0d9488" />
                  <span>Doctor</span>
                </button>
                <button
                  type="button"
                  className="demo-pill-btn demo-pill-patient"
                  onClick={() => demoLogin("patient")}
                  title="Instant 1-Click Login as Patient"
                >
                  <User size={13} color="#6366f1" />
                  <span>Patient</span>
                </button>
              </div>

              <div className="auth-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenAuth("login")}
                >
                  <LogIn size={15} />
                  <span>LOGIN</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenAuth("register")}
                >
                  <UserPlus size={15} />
                  <span>REGISTER</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
