/* eslint-env node */
'use strict';

const express = require('express');
const router  = express.Router();

// ✅ Capital A — matches actual filename: Aicontroller.js
const { generateSummary } = require('../controllers/Aicontroller');

// POST /api/ai/summary
router.post('/summary', generateSummary);

module.exports = router;