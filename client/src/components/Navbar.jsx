import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  User,
  LogOut,
  Shield,
  Stethoscope,
  LogIn,
  UserPlus
} from "lucide-react";

export default function Navbar({ onOpenAuth, onGoHome }) {
  const { user, logout } = useAuth();

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
          )}
        </div>
      </div>
    </header>
  );
}
