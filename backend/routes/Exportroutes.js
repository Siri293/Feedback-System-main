/* eslint-env node */
'use strict';

const express = require('express');
const router  = express.Router();

// ✅ Capital E — matches actual filename: Exportcontroller.js
const { exportCSV, exportPDFData } = require('../controllers/Exportcontroller');

// GET /api/export/csv
router.get('/csv', exportCSV);

// GET /api/export/pdf-data
router.get('/pdf-data', exportPDFData);

module.exports = router;