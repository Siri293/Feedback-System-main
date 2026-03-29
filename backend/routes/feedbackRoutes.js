/* eslint-env node */
'use strict';

const express = require('express');
const router  = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getAnalytics,
  deleteFeedback,
  updateFeedback
} = require('../controllers/feedbackController');

// GET  /api/feedback/analytics  — must be BEFORE /:id
router.get('/analytics', getAnalytics);

// GET  /api/feedback
router.get('/', getAllFeedback);

// POST /api/feedback
router.post('/', submitFeedback);

// PUT  /api/feedback/:id  — update (ownership verified via email)
router.put('/:id', updateFeedback);

// DELETE /api/feedback/:id  — delete (ownership verified via email)
router.delete('/:id', deleteFeedback);

module.exports = router;