import React, { useState } from 'react';
import { feedbackService } from '../services/api.js';

/* ------------------------------------------------------------------ */
/*  Sub-components                                                       */
/* ------------------------------------------------------------------ */

function SentimentBadge({ label }) {
  const icons = { Positive: '↑', Negative: '↓', Neutral: '→' };
  return (
    <span className={`badge ${label}`}>
      <span className="badge-dot"></span>
      {icons[label]} {label}
    </span>
  );
}

// ✅ FIX: accepts raw value, guards against NaN with toFixed only on valid number
function CompoundScore({ value }) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return <span className="compound-score neu">—</span>;
  }
  const cls = num >= 0.05 ? 'pos' : num <= -0.05 ? 'neg' : 'neu';
  return (
    <span className={`compound-score ${cls}`}>
      {num >= 0 ? '+' : ''}{num.toFixed(3)}
    </span>
  );
}

// ✅ FIX: schema has no rating column — shows "N/A" gracefully instead of 0 empty stars
function StarDisplay({ rating }) {
  const r = parseInt(rating, 10);
  if (!r || r === 0) {
    return (
      <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontStyle: 'italic' }}>N/A</span>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{
          fontSize: '1rem',
          color: star <= r ? '#F59E0B' : '#D1D5DB'
        }}>★</span>
      ))}
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <div className="avatar">{initials}</div>;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Popup                                           */
/* ------------------------------------------------------------------ */

function DeletePopup({ feedback, onConfirm, onCancel, loading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function handleConfirm() {
    if (!email.trim()) {
      setError('Please enter your email to confirm.');
      return;
    }
    setError('');
    onConfirm(feedback.id, email.trim());
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={popupBoxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.6rem' }}>🗑️</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111' }}>Delete Feedback?</h3>
        </div>

        <p style={{ color: '#555', fontSize: '0.92rem', marginBottom: 16, lineHeight: 1.5 }}>
          Are you sure you want to delete this feedback?<br />
          <strong>This action cannot be undone.</strong><br />
          <span style={{ color: '#EF4444', fontSize: '0.85rem' }}>
            ⚠️ You can only delete your own feedback.
          </span>
        </p>

        <div style={previewBoxStyle}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{feedback.name}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#666' }}>
            {feedback.message.length > 80
              ? feedback.message.slice(0, 80) + '…'
              : feedback.message}
          </p>
        </div>

        <label style={labelStyle}>Enter your email to confirm ownership:</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          style={popupInputStyle}
          autoFocus
        />

        {error && <p style={{ color: '#EF4444', fontSize: '0.83rem', marginTop: 6 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} disabled={loading} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleConfirm} disabled={loading} style={deleteBtnStyle}>
            {loading ? 'Deleting...' : 'Yes, Delete It'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Modal                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = ['Product', 'Service', 'Website', 'Support'];

function EditModal({ feedback, onSave, onCancel, loading }) {
  const [email, setEmail]       = useState('');
  const [category, setCategory] = useState(feedback.category || '');
  const [rating, setRating]     = useState(feedback.rating || 0);
  const [message, setMessage]   = useState(feedback.message || '');
  const [error, setError]       = useState('');
  const [hovered, setHovered]   = useState(0);

  async function handleSave() {
    if (!email.trim()) { setError('Please enter your email to verify ownership.'); return; }
    if (!message.trim()) { setError('Message cannot be empty.'); return; }
    setError('');
    onSave(feedback.id, { email: email.trim(), category, rating, message: message.trim() });
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={{ ...popupBoxStyle, maxWidth: 500, width: '95%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>✏️</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111' }}>Edit Your Feedback</h3>
        </div>

        <p style={{ color: '#888', fontSize: '0.83rem', marginBottom: 14 }}>
          ⚠️ You can only edit your own feedback. Enter your email to verify.
        </p>

        <label style={labelStyle}>Your Email (to verify ownership)</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          style={popupInputStyle}
          autoFocus
        />

        <label style={labelStyle}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={popupInputStyle}>
          <option value="">Select Category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={labelStyle}>Rating</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                fontSize: '1.6rem', cursor: 'pointer',
                color: star <= (hovered || rating) ? '#F59E0B' : '#D1D5DB',
                transition: '0.15s'
              }}
            >★</span>
          ))}
        </div>

        <label style={labelStyle}>Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          style={{ ...popupInputStyle, resize: 'vertical' }}
        />
        <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{message.length}/1000 characters</p>

        {error && <p style={{ color: '#EF4444', fontSize: '0.83rem', marginTop: 4 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} disabled={loading} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={saveBtnStyle}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main FeedbackList Component                                         */
/* ------------------------------------------------------------------ */

export default function FeedbackList({ feedbacks, loading, onDelete, onUpdate }) {
  const [filter, setFilter]               = useState('All');
  const [deletingId, setDeletingId]       = useState(null);
  const [editingFb, setEditingFb]         = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId]       = useState(null);
  const [toast, setToast]                 = useState(null);

  const filters = ['All', 'Positive', 'Negative', 'Neutral'];

  const filtered = filter === 'All'
    ? feedbacks
    : feedbacks.filter(f => f.sentiment_label === filter);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDeleteConfirm(id, email) {
    setActionLoading(true);
    try {
      await feedbackService.delete(id, email);
      onDelete(id);
      setDeleteTarget(null);
      showToast('Feedback deleted successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateSave(id, data) {
    setActionLoading(true);
    try {
      await feedbackService.update(id, data);
      onUpdate(id, data);
      setEditingFb(null);
      showToast('Feedback updated successfully! ✨');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner dark"></div>
        <span>Loading feedback...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          ...toastStyle,
          background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: toast.type === 'error' ? '#DC2626' : '#065F46',
          borderColor: toast.type === 'error' ? '#FCA5A5' : '#6EE7B7'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Delete popup */}
      {deleteTarget && (
        <DeletePopup
          feedback={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Edit modal */}
      {editingFb && (
        <EditModal
          feedback={editingFb}
          onSave={handleUpdateSave}
          onCancel={() => setEditingFb(null)}
          loading={actionLoading}
        />
      )}

      {/* Header + Filters */}
      <div className="feedback-section-header">
        <h3>
          All Feedback{' '}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ({filtered.length} entries)
          </span>
        </h3>
        <div className="filter-tabs">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h4>No feedback yet</h4>
            <p>
              {filter === 'All'
                ? 'No feedback has been submitted. Be the first to share your thoughts!'
                : `No ${filter.toLowerCase()} feedback found.`}
            </p>
          </div>
        ) : (
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Message</th>
                  <th>Rating</th>
                  <th>Sentiment</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(fb => (
                  <tr key={fb.id}>

                    {/* Customer */}
                    <td>
                      <div className="name-cell">
                        <Avatar name={fb.name} />
                        <div>
                          <div className="name-text">{fb.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Message */}
                    <td>
                      <div
                        className="message-cell"
                        title={fb.message}
                        onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {expandedId === fb.id
                          ? fb.message
                          : fb.message.length > 80
                            ? fb.message.slice(0, 80) + '…'
                            : fb.message}
                      </div>
                    </td>

                    {/* ✅ FIX: fb.rating is always 0/null since schema has no rating column */}
                    <td><StarDisplay rating={fb.rating || 0} /></td>

                    {/* Sentiment */}
                    <td><SentimentBadge label={fb.sentiment_label} /></td>

                    {/* ✅ FIX: use sentiment_compound (correct DB column), not sentiment_score */}
                    <td><CompoundScore value={fb.sentiment_compound} /></td>

                    {/* Date */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      📅 {formatDate(fb.created_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-icon"
                          onClick={() => setEditingFb(fb)}
                          title="Edit your feedback"
                          style={editBtnStyle}
                        >✏️</button>
                        <button
                          className="btn btn-icon"
                          onClick={() => setDeleteTarget(fb)}
                          disabled={deletingId === fb.id}
                          title="Delete your feedback"
                          style={deleteBtnIconStyle}
                        >
                          {deletingId === fb.id
                            ? <span className="spinner dark" style={{ width: 14, height: 14 }}></span>
                            : '🗑️'}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const popupOverlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999
};

const popupBoxStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: '28px 30px',
  maxWidth: 420,
  width: '95%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  animation: 'fadeIn 0.2s ease'
};

const previewBoxStyle = {
  background: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  padding: '10px 14px',
  marginBottom: 16
};

const popupInputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8,
  fontSize: '0.9rem',
  background: '#F9FAFB',
  boxSizing: 'border-box',
  marginBottom: 10,
  outline: 'none'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: 5
};

const cancelBtnStyle = {
  flex: 1, padding: '10px 0',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8, background: '#fff',
  color: '#555', fontWeight: 600,
  cursor: 'pointer', fontSize: '0.9rem'
};

const deleteBtnStyle = {
  flex: 1, padding: '10px 0',
  border: 'none', borderRadius: 8,
  background: 'linear-gradient(90deg,#EF4444,#DC2626)',
  color: '#fff', fontWeight: 600,
  cursor: 'pointer', fontSize: '0.9rem'
};

const saveBtnStyle = {
  flex: 1, padding: '10px 0',
  border: 'none', borderRadius: 8,
  background: 'linear-gradient(90deg,#4F46E5,#6366F1)',
  color: '#fff', fontWeight: 600,
  cursor: 'pointer', fontSize: '0.9rem'
};

const editBtnStyle = {
  padding: '6px 10px',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8, background: '#F9FAFB',
  cursor: 'pointer', fontSize: '0.88rem'
};

const deleteBtnIconStyle = {
  padding: '6px 10px',
  border: '1.5px solid #FCA5A5',
  borderRadius: 8, background: '#FEF2F2',
  cursor: 'pointer', fontSize: '0.88rem'
};

const toastStyle = {
  position: 'fixed', bottom: 24, right: 24,
  padding: '12px 18px',
  borderRadius: 10, border: '1.5px solid',
  fontWeight: 600, fontSize: '0.9rem',
  zIndex: 99999,
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  animation: 'fadeIn 0.3s ease'
};