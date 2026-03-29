/* eslint-env node */
'use strict';

const { pool } = require('../config/db');

// GET /api/export/csv
exports.exportCSV = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, message, sentiment_label, sentiment_compound, created_at
       FROM feedbacks ORDER BY created_at DESC`
    );

    const headers = ['ID', 'Name', 'Email', 'Message', 'Sentiment', 'Score', 'Date'];

    const csvRows = rows.map(r => [
      r.id,
      `"${(r.name    || '').replace(/"/g, '""')}"`,
      `"${(r.email   || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      r.sentiment_label   || '',
      parseFloat(r.sentiment_compound || 0).toFixed(3),
      new Date(r.created_at).toLocaleDateString('en-US')
    ].join(','));

    const csv      = [headers.join(','), ...csvRows].join('\n');
    const filename = `feedbackiq-export-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);

  } catch (err) {
    console.error('CSV Export Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to export CSV.' });
  }
};

// GET /api/export/pdf-data
exports.exportPDFData = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, message, sentiment_label, sentiment_compound, created_at
       FROM feedbacks ORDER BY created_at DESC`
    );

    const total    = rows.length;
    const positive = rows.filter(r => r.sentiment_label === 'Positive').length;
    const negative = rows.filter(r => r.sentiment_label === 'Negative').length;
    const neutral  = rows.filter(r => r.sentiment_label === 'Neutral').length;

    return res.json({
      success: true,
      data: {
        feedbacks: rows,
        analytics: { total, positive, negative, neutral }
      }
    });

  } catch (err) {
    console.error('PDF Data Error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch PDF data.' });
  }
};