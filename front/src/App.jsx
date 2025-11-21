import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Auth from "./components/Auth";
import SignUp from "./components/SignUp";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // Додаємо клас теми на body
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      {/* ===== Перемикач теми (завжди зверху) ===== */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        {theme === "light" ? "Темна тема" : "Світла тема"}
      </button>

      {/* ===== Маршрути ===== */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
