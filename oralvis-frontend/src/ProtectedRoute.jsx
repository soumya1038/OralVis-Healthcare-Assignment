// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// import Cookies from "js-cookie";

const ProtectedRoute = ({ element }) => {
  const location = useLocation();
  const token = localStorage.getItem("Token"); // use exact cookie name you set

  if (!token) {
    // Save attempted path (including query string) so login can restore it
    sessionStorage.setItem("lastPath", location.pathname + location.search);
    // redirect to login
    return <Navigate to="/login" replace />;
  }

  // logged in -> render element
  return element;
};

export default ProtectedRoute;
