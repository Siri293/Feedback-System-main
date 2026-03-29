import React, { useState } from "react";
import { feedbackService } from "../services/api.js";

const MAX_MESSAGE_LENGTH = 1000;

const CATEGORIES = ["Product", "Service", "Website", "Support", "Delivery", "Pricing"];

// ✅ Static products matching DB — no API fetch needed
const PRODUCTS = [
  { id: 1, name: "Product" },
  { id: 2, name: "Service" },
  { id: 3, name: "Website" },
  { id: 4, name: "Support" }
];

const COUNTRIES = [
  "Australia","Brazil","Canada","China","France","Germany","India",
  "Indonesia","Italy","Japan","Mexico","Netherlands","New Zealand",
  "Nigeria","Pakistan","Philippines","Russia","Saudi Arabia",
  "Singapore","South Africa","South Korea","Spain","Turkey",
  "United Arab Emirates","United Kingdom","United States","Other"
];

/* ⭐ Star Rating */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: "1.8rem", cursor: "pointer",
            color: star <= (hovered || value) ? "#F59E0B" : "#D1D5DB",
            transition: "0.15s"
          }}>★</span>
      ))}
    </div>
  );
}

/* 😊 Sentiment Result */
function SentimentResult({ sentiment }) {
  if (!sentiment) return null;
  const icons  = { Positive: "😊", Negative: "😔", Neutral: "😐" };
  const colors = { Positive: "#10B981", Negative: "#EF4444", Neutral: "#F59E0B" };
  return (
    <div style={{
      marginTop: 24, borderRadius: 12, padding: 20,
      border: `2px solid ${colors[sentiment.label]}`, background: "#F9FAFB"
    }}>
      <h3 style={{ color: colors[sentiment.label] }}>
        {icons[sentiment.label]} {sentiment.label} Sentiment
      </h3>
      <p><strong>Score:</strong> {Number(sentiment.compound || 0).toFixed(3)}</p>
      <div style={{ display: "flex", gap: 20 }}>
        <p>😊 Positive: {(sentiment.positive * 100).toFixed(1)}%</p>
        <p>😐 Neutral: {(sentiment.neutral * 100).toFixed(1)}%</p>
        <p>😔 Negative: {(sentiment.negative * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}

/* ✅ Confirm Popup */
function ConfirmPopup({ onConfirm, onCancel, formData }) {
  const productName = PRODUCTS.find(p => p.id === parseInt(formData.product_id))?.name || '—';
  return (
    <div style={overlayStyle}>
      <div style={popupBoxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.6rem' }}>📝</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111' }}>Submit Feedback?</h3>
        </div>
        <div style={previewStyle}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{formData.name}</p>
          <p style={{ margin: '2px 0', fontSize: '0.83rem', color: '#666' }}>
            {formData.category} • {productName} • {formData.country} • {'★'.repeat(formData.rating)}{'☆'.repeat(5 - formData.rating)}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#555' }}>
            {formData.message.length > 80
              ? formData.message.slice(0, 80) + '…'
              : formData.message}
          </p>
        </div>
        <p style={{ color: '#555', fontSize: '0.92rem', marginBottom: 20 }}>
          Are you sure you want to submit this feedback?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button onClick={onConfirm} style={confirmBtnStyle}>Yes, Submit It ✅</button>
        </div>
      </div>
    </div>
  );
}

/* 📩 Main Feedback Form */
export default function FeedbackForm({ onSubmitSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", category: "", message: "",
    rating: 0, country: "", product_id: ""
  });
  const [loading, setLoading]                 = useState(false);
  const [sentimentResult, setSentimentResult] = useState(null);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [showConfirm, setShowConfirm]         = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmitClick(e) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)."); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address."); return;
    }
    if (!form.category) {
      setError("Please select a category."); return;
    }
    // ✅ Country is now required
    if (!form.country) {
      setError("Please select your country."); return;
    }
    // ✅ Product is now required
    if (!form.product_id) {
      setError("Please select a product."); return;
    }
    if (form.rating === 0) {
      setError("Please select a star rating."); return;
    }
    if (form.message.trim().length < 10) {
      setError("Feedback message must be at least 10 characters."); return;
    }
    setShowConfirm(true);
  }

  async function handleConfirmedSubmit() {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await feedbackService.submit({
        name:       form.name,
        email:      form.email,
        category:   form.category,
        rating:     form.rating,
        country:    form.country,
        product_id: form.product_id,
        message:    form.message
      });
      const sentiment = res?.sentiment || res?.data?.sentiment;
      if (sentiment) setSentimentResult(sentiment);
      setSuccess("✅ Feedback submitted successfully! Thank you for your response.");
      setForm({ name: "", email: "", category: "", message: "", rating: 0, country: "", product_id: "" });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmPopup formData={form}
          onConfirm={handleConfirmedSubmit}
          onCancel={() => setShowConfirm(false)} />
      )}

      <div style={{
        maxWidth: 520, margin: "auto", background: "#fff",
        padding: 28, borderRadius: 14,
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
      }}>
        <h2>Share Your Feedback</h2>

        {success && (
          <div style={{
            background: "#D1FAE5", border: "1.5px solid #6EE7B7",
            color: "#065F46", borderRadius: 8, padding: "10px 14px",
            marginBottom: 14, fontWeight: 600, fontSize: "0.9rem"
          }}>{success}</div>
        )}
        {error && (
          <div style={{
            background: "#FEE2E2", border: "1.5px solid #FCA5A5",
            color: "#DC2626", borderRadius: 8, padding: "10px 14px",
            marginBottom: 14, fontWeight: 600, fontSize: "0.9rem"
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmitClick} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Full Name */}
          <label>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" name="name" placeholder="John Anderson"
            value={form.name} onChange={handleChange} required style={inputStyle} />

          {/* Email */}
          <label>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="email" name="email" placeholder="john@example.com"
            value={form.email} onChange={handleChange} required style={inputStyle} />

          {/* Category + Country side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }}>
                Category <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select name="category" value={form.category} onChange={handleChange}
                required style={inputStyle}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6 }}>
                Country <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select name="country" value={form.country} onChange={handleChange}
                required style={inputStyle}>
                <option value="">Select Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Product — required, static options */}
          <label>
            Product <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <select name="product_id" value={form.product_id} onChange={handleChange}
            required style={inputStyle}>
            <option value="">Select Product</option>
            {PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Star Rating */}
          <label>Your Experience <span style={{ color: '#EF4444' }}>*</span></label>
          <StarRating value={form.rating}
            onChange={val => setForm(prev => ({ ...prev, rating: val }))} />

          {/* Message */}
          <label>Your Feedback <span style={{ color: '#EF4444' }}>*</span></label>
          <textarea name="message" placeholder="Tell us about your experience..."
            value={form.message} onChange={handleChange}
            maxLength={MAX_MESSAGE_LENGTH} required
            style={{ ...inputStyle, height: 120 }} />
          <p style={{ fontSize: "0.78rem", color: "#999", marginTop: -10 }}>
            {form.message.length}/{MAX_MESSAGE_LENGTH} characters
          </p>

          <button type="submit" disabled={loading} style={{
            marginTop: 10, padding: 14, border: "none", borderRadius: 10,
            background: loading ? "#A5B4FC" : "linear-gradient(90deg,#4F46E5,#6366F1)",
            color: "#fff", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.95rem", transition: "0.2s"
          }}>
            {loading ? "⏳ Submitting..." : "Submit & Analyze Sentiment"}
          </button>
        </form>

        <SentimentResult sentiment={sentimentResult} />
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const inputStyle = {
  width: "100%", padding: "12px 14px",
  border: "1.5px solid #E5E7EB", borderRadius: 10,
  fontSize: "0.95rem", background: "#F9FAFB",
  boxSizing: "border-box"
};
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(4px)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9999
};
const popupBoxStyle = {
  background: '#fff', borderRadius: 16, padding: '28px 30px',
  maxWidth: 420, width: '95%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
};
const previewStyle = {
  background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 10, padding: '10px 14px', marginBottom: 16
};
const cancelBtnStyle = {
  flex: 1, padding: '10px 0', border: '1.5px solid #E5E7EB',
  borderRadius: 8, background: '#fff', color: '#555',
  fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
};
const confirmBtnStyle = {
  flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
  background: 'linear-gradient(90deg,#4F46E5,#6366F1)',
  color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
};