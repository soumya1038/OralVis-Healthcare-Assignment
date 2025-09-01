import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Get user info from cookie (stored as JSON when logging in)
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  const handleLogout = () => {
    Cookies.remove("Token");
    localStorage.removeItem("Token");
    Cookies.remove("user"); // clear user info too
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-brand">
        <span className="brand-text">OralVis Healthcare</span>
      </div>

      {/* Right: User info + Logout */}
      {user && (
        <div className="navbar-user">
          <span className="user-info">
            <i className="fa fa-user mr-1"></i>
            {user.email} | <span className="user-role">{user.role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
