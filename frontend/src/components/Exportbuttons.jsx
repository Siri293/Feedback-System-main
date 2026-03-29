import React, { useState } from 'react';
import { exportService } from '../services/api.js';

export default function ExportButtons({ feedbacks, analytics }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  function handleCSV() {
    exportService.downloadCSV();
  }

  async function handlePDF() {
    setPdfLoading(true);
    try {
      // Build a print-ready HTML page and open it in a new tab
      const total    = analytics?.total || feedbacks.length;
      const positive = analytics?.positive_count || analytics?.positive || 0;
      const negative = analytics?.negative_count || analytics?.negative || 0;
      const neutral  = analytics?.neutral_count  || analytics?.neutral  || 0;
      const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
      const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;
      const neutralPct  = total > 0 ? Math.round((neutral  / total) * 100) : 0;

      const rows = feedbacks.slice(0, 100).map(f => `
        <tr>
          <td>${f.id}</td>
          <td>${escapeHtml(f.name)}</td>
          <td>${escapeHtml(f.email)}</td>
          <td>${escapeHtml(f.message.slice(0, 120))}${f.message.length > 120 ? '…' : ''}</td>
          <td class="sent-${f.sentiment_label?.toLowerCase()}">${f.sentiment_label}</td>
          <td>${parseFloat(f.sentiment_compound || 0).toFixed(3)}</td>
          <td>${new Date(f.created_at).toLocaleDateString('en-US')}</td>
        </tr>
      `).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FeedbackIQ Report — ${new Date().toLocaleDateString('en-US')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1E293B; padding: 32px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #E2E8F0; }
    .logo { font-size: 22px; font-weight: 900; color: #2563EB; }
    .date { font-size: 11px; color: #64748B; text-align: right; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; text-align: center; }
    .summary-card .val { font-size: 26px; font-weight: 900; color: #1E293B; }
    .summary-card .lbl { font-size: 10px; color: #64748B; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
    .summary-card.pos .val { color: #10B981; }
    .summary-card.neg .val { color: #EF4444; }
    .summary-card.neu .val { color: #F59E0B; }
    h2 { font-size: 14px; margin-bottom: 12px; color: #1E293B; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #F8FAFC; padding: 8px 10px; text-align: left; border-bottom: 2px solid #E2E8F0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748B; }
    td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; vertical-align: top; }
    .sent-positive { color: #10B981; font-weight: 700; }
    .sent-negative { color: #EF4444; font-weight: 700; }
    .sent-neutral  { color: #F59E0B; font-weight: 700; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8; text-align: center; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">◈ FeedbackIQ</div>
      <div style="font-size:11px;color:#64748B;margin-top:4px;">Customer Feedback Intelligence Report</div>
    </div>
    <div class="date">
      Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
      Total Entries: ${total}
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card"><div class="val">${total}</div><div class="lbl">Total Feedback</div></div>
    <div class="summary-card pos"><div class="val">${positive} <span style="font-size:14px">(${positivePct}%)</span></div><div class="lbl">Positive</div></div>
    <div class="summary-card neg"><div class="val">${negative} <span style="font-size:14px">(${negativePct}%)</span></div><div class="lbl">Negative</div></div>
    <div class="summary-card neu"><div class="val">${neutral} <span style="font-size:14px">(${neutralPct}%)</span></div><div class="lbl">Neutral</div></div>
  </div>

  <h2>📋 Feedback Entries ${feedbacks.length > 100 ? '(showing first 100)' : ''}</h2>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Name</th><th>Email</th><th>Message</th>
        <th>Sentiment</th><th>Score</th><th>Date</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    FeedbackIQ — Powered by VADER NLP Sentiment Analysis · © ${new Date().getFullYear()}
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {/* CSV Button */}
      <button
        onClick={handleCSV}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px',
          background: 'linear-gradient(135deg,#10B981,#059669)',
          border: 'none', borderRadius: 10,
          color: '#fff', fontWeight: 700, fontSize: '0.88rem',
          cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.3)'; }}
      >
        📥 Export CSV
      </button>

      {/* PDF Button */}
      <button
        onClick={handlePDF}
        disabled={pdfLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px',
          background: pdfLoading
            ? '#CBD5E1'
            : 'linear-gradient(135deg,#EF4444,#DC2626)',
          border: 'none', borderRadius: 10,
          color: '#fff', fontWeight: 700, fontSize: '0.88rem',
          cursor: pdfLoading ? 'not-allowed' : 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
        }}
        onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)'; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)'; }}
      >
        {pdfLoading ? '⏳ Preparing…' : '🖨️ Export PDF'}
      </button>
    </div>
  );
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}