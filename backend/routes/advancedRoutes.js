/* eslint-env node */
'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/advancedController');

// ── Helper endpoints ─────────────────────────────────────────
router.get('/products',       ctrl.getProducts);         // products dropdown
router.get('/flagged',        ctrl.getFlaggedFeedbacks); // Trigger 1 results
router.get('/product-scores', ctrl.getProductScores);    // Trigger 3 results

// ── Views (7, 8, 9) ──────────────────────────────────────────
router.get('/daily-report',       ctrl.getDailyReport);      // View 7
router.get('/product-sentiment',  ctrl.getProductSentiment); // View 8
router.get('/country-feedback',   ctrl.getCountryFeedback);  // View 9

// ── Nested queries (10, 11, 12) ──────────────────────────────
router.get('/top-positive-products',  ctrl.getTopPositiveProducts);  // Query 10
router.get('/most-active-customers',  ctrl.getMostActiveCustomers);  // Query 11
router.get('/category-sentiment',     ctrl.getCategorySentiment);    // Query 12

// ── Join queries (13, 14, 15) ─────────────────────────────────
router.get('/feedback-details', ctrl.getFeedbackDetails); // Query 13
router.get('/product-trend',    ctrl.getProductTrend);    // Query 14
router.get('/country-sentiment',ctrl.getCountrySentiment);// Query 15

// ── Stored procedures (SP 5, SP 6) ───────────────────────────
router.get('/sp/product-breakdown/:id', ctrl.spProductBreakdown); // SP 5 (with id)
router.get('/sp/product-breakdown',     ctrl.spProductBreakdown); // SP 5 (all)
router.get('/sp/top-customers',         ctrl.spTopCustomers);     // SP 6

module.exports = router;