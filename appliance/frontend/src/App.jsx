import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    navigate("/login");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? <Navigate to="/" /> : <Login onLogin={handleLogin} onRegisterClick={goToRegister} />
        }
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/" /> : <Register />}
      />
      <Route
        path="/*"
        element={
          token ? <Dashboard token={token} role={role} logout={handleLogout} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}
