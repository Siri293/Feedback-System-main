import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Dashboard from './components/Dashboard.jsx';

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">FeedbackIQ</span>
        </div>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Submit Feedback
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </NavLink>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} FeedbackIQ — Powered by VADER NLP Sentiment Analysis</p>
      </footer>
    </div>
  );
}
