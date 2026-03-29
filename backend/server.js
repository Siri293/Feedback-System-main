require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const feedbackRoutes = require('./routes/feedbackRoutes');
const aiRoutes       = require('./routes/Airoutes');
const exportRoutes   = require('./routes/Exportroutes');
const advancedRoutes = require('./routes/advancedRoutes');   // ✅ NEW
const errorHandler   = require('./middleware/errorHandler');
const { testConnection } = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/export',   exportRoutes);
app.use('/api/advanced', advancedRoutes);   // ✅ All 15 advanced endpoints

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FeedbackIQ API running',
    timestamp: new Date().toISOString(),
    endpoints: {
      feedback:  '/api/feedback',
      ai:        '/api/ai/summary',
      export:    '/api/export/csv | /api/export/pdf-data',
      advanced:  '/api/advanced/*  (15 DB feature endpoints)'
    }
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`\n🚀 FeedbackIQ API  →  http://localhost:${PORT}`);
  console.log(`📡 Health check    →  http://localhost:${PORT}/api/health`);
  console.log(`🧩 Advanced DB     →  http://localhost:${PORT}/api/advanced/`);
  await testConnection();
});

module.exports = app;