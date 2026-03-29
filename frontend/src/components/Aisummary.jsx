import React, { useState } from 'react';
import { aiService } from '../services/api.js';

export default function AISummary({ feedbacks }) {
  const [summary, setSummary]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (feedbacks.length === 0) {
      setError('No feedback data to summarize.');
      return;
    }
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await aiService.getSummary(feedbacks);
      if (res.success) {
        setSummary(res.summary);
        setGenerated(true);
      } else {
        setError(res.error || 'Failed to generate summary.');
      }
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        'Could not reach AI service. Check your GEMINI_API_KEY in .env'
      );
    } finally {
      setLoading(false);
    }
  }

  // Parse the 3-sentence summary into individual lines
  const lines = summary
    ? summary.split(/(?<=[.!?])\s+/).filter(Boolean)
    : [];

  const lineIcons = ['📊', '✅', '⚠️'];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E293B 0%, #1a2744 100%)',
      borderRadius: 16,
      padding: '28px',
      border: '1px solid rgba(99,102,241,0.3)',
      boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
      marginBottom: 28
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0
          }}>🤖</div>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff', margin: 0 }}>
              AI Executive Summary
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Powered by Google Gemini 1.5 Flash · Free tier
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || feedbacks.length === 0}
          style={{
            padding: '10px 20px',
            background: loading
              ? 'rgba(99,102,241,0.3)'
              : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: loading || feedbacks.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
            opacity: feedbacks.length === 0 ? 0.5 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block'
              }}></span>
              Analyzing…
            </>
          ) : generated ? '🔄 Re-generate' : '✨ Summarize All Feedback'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', color: '#FCA5A5',
          fontSize: '0.88rem'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: 8 }}>🤖 Gemini is analyzing {feedbacks.length} feedback entries…</div>
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.1)',
            borderRadius: 99, overflow: 'hidden', maxWidth: 300, margin: '0 auto'
          }}>
            <div style={{
              height: '100%', width: '60%',
              background: 'linear-gradient(90deg,#6366F1,#8B5CF6)',
              borderRadius: 99,
              animation: 'shimmer 1.5s ease-in-out infinite alternate'
            }}></div>
          </div>
        </div>
      )}

      {/* Summary result */}
      {summary && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                animation: `fadeIn 0.4s ease ${i * 0.15}s both`
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>
                {lineIcons[i] || '•'}
              </span>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                {line}
              </p>
            </div>
          ))}
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: '8px 0 0', textAlign: 'right' }}>
            Generated by Gemini 1.5 Flash · {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Idle state (before first generation) */}
      {!summary && !loading && !error && (
        <div style={{
          border: '1.5px dashed rgba(99,102,241,0.3)',
          borderRadius: 12, padding: '24px',
          textAlign: 'center', color: 'rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✨</div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
            Click "Summarize All Feedback" to get a 3-sentence<br />AI executive summary of all customer feedback.
          </p>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}