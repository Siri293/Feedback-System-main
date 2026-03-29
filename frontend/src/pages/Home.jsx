import React from "react";
import FeedbackForm from "../components/FeedbackForm.jsx";
import PublicAnalytics from "../components/Publicanalytics.jsx";

export default function Home() {
  return (
    <div>

      {/* HERO SECTION */}
      <section style={{
        textAlign: "center",
        padding: "80px 20px",
        background: "linear-gradient(120deg,#4F46E5,#6366F1)",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          marginBottom: "10px",
          fontFamily: "Syne, sans-serif"
        }}>
          FeedbackIQ
        </h1>

        <p style={{
          fontSize: "1.1rem",
          opacity: 0.9,
          maxWidth: "600px",
          margin: "auto"
        }}>
          AI-Powered Customer Feedback Intelligence Platform.<br />
          Understand how customers feel using real-time sentiment analysis.
        </p>

        <div style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          <a href="#feedback">
            <button style={buttonStyleWhite}>📝 Submit Feedback</button>
          </a>
          <a href="#analytics">
            <button style={buttonStyleOutline}>📊 View Analytics</button>
          </a>
        </div>
      </section>

      {/* PUBLIC ANALYTICS SECTION — visible to everyone */}
      <section id="analytics" style={{
        padding: "60px 24px",
        background: "#F8FAFC",
        borderBottom: "1px solid #E2E8F0"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <PublicAnalytics />
        </div>
      </section>

      {/* FEEDBACK FORM */}
      <section id="feedback" style={{
        padding: "60px 24px"
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: "1.6rem", color: "#1E293B", marginBottom: 8
            }}>Share Your Feedback</h2>
            <p style={{ color: "#64748B", fontSize: "0.92rem" }}>
              Your opinion helps us improve. Takes less than 2 minutes.
            </p>
          </div>
          <FeedbackForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center",
        padding: "30px",
        background: "#111827",
        color: "#9CA3AF"
      }}>
        <p style={{ fontWeight: "600", color: "white", fontFamily: "Syne, sans-serif" }}>
          FeedbackIQ
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          AI-Powered Customer Sentiment Analytics Platform
        </p>
        <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>
          Built with React • Node • MySQL • VADER NLP
        </p>
        <p style={{ marginTop: "8px", fontSize: "0.75rem" }}>
          © 2026
        </p>
      </footer>

    </div>
  );
}

const buttonStyleWhite = {
  background: "white",
  color: "#4F46E5",
  border: "none",
  padding: "12px 22px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "0.95rem"
};

const buttonStyleOutline = {
  background: "transparent",
  color: "white",
  border: "2px solid white",
  padding: "12px 22px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "0.95rem"
};