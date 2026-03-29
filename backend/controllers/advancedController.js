/* eslint-env node */
'use strict';

const { pool } = require('../config/db');

// ============================================================
// VIEWS — Endpoints 7, 8, 9
// ============================================================

// GET /api/advanced/daily-report  → View 7
exports.getDailyReport = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_daily_sentiment_report');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/product-sentiment  → View 8
exports.getProductSentiment = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_product_sentiment');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/country-feedback  → View 9
exports.getCountryFeedback = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM vw_country_feedback');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// NESTED QUERIES — Endpoints 10, 11, 12
// ============================================================

// GET /api/advanced/top-positive-products  → Query 10
exports.getTopPositiveProducts = async (req, res) => {
  try {
    const sql = `
      SELECT
        p.id          AS product_id,
        p.name        AS product_name,
        pos.pos_count AS positive_feedback_count,
        ROUND(pos.pos_count * 100.0 / NULLIF(tot.total, 0), 1) AS positive_pct
      FROM products p
      JOIN (
        SELECT product_id, COUNT(*) AS pos_count
        FROM feedbacks
        WHERE sentiment_label = 'Positive'
          AND product_id IS NOT NULL
        GROUP BY product_id
      ) AS pos ON p.id = pos.product_id
      JOIN (
        SELECT product_id, COUNT(*) AS total
        FROM feedbacks
        WHERE product_id IS NOT NULL
        GROUP BY product_id
      ) AS tot ON p.id = tot.product_id
      WHERE pos.pos_count = (
        SELECT MAX(sub_pos)
        FROM (
          SELECT COUNT(*) AS sub_pos
          FROM feedbacks
          WHERE sentiment_label = 'Positive' AND product_id IS NOT NULL
          GROUP BY product_id
        ) AS max_sub
      )
      ORDER BY positive_feedback_count DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/most-active-customers  → Query 11
exports.getMostActiveCustomers = async (req, res) => {
  try {
    const sql = `
      SELECT
        name,
        email,
        country,
        feedback_count,
        avg_sentiment,
        positive_given,
        negative_given,
        rank_num
      FROM (
        SELECT
          name,
          email,
          country,
          COUNT(*)                            AS feedback_count,
          ROUND(AVG(sentiment_compound), 4)   AS avg_sentiment,
          SUM(sentiment_label = 'Positive')   AS positive_given,
          SUM(sentiment_label = 'Negative')   AS negative_given,
          RANK() OVER (ORDER BY COUNT(*) DESC) AS rank_num
        FROM feedbacks
        GROUP BY name, email, country
      ) AS ranked
      WHERE rank_num <= 10
      ORDER BY feedback_count DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/category-sentiment  → Query 12
exports.getCategorySentiment = async (req, res) => {
  try {
    const sql = `
      SELECT
        category,
        total,
        avg_compound,
        avg_rating,
        positive_count,
        negative_count,
        neutral_count,
        CASE
          WHEN avg_compound >= 0.05  THEN 'Generally Positive'
          WHEN avg_compound <= -0.05 THEN 'Generally Negative'
          ELSE 'Mixed / Neutral'
        END AS overall_verdict
      FROM (
        SELECT
          COALESCE(category, 'Uncategorized') AS category,
          COUNT(*)                             AS total,
          ROUND(AVG(sentiment_compound), 4)    AS avg_compound,
          ROUND(AVG(rating), 1)                AS avg_rating,
          SUM(sentiment_label = 'Positive')    AS positive_count,
          SUM(sentiment_label = 'Negative')    AS negative_count,
          SUM(sentiment_label = 'Neutral')     AS neutral_count
        FROM feedbacks
        GROUP BY category
      ) AS category_stats
      ORDER BY avg_compound DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// JOIN QUERIES — Endpoints 13, 14, 15
// ============================================================

// GET /api/advanced/feedback-details  → Query 13
exports.getFeedbackDetails = async (req, res) => {
  try {
    const sql = `
      SELECT
        f.id,
        f.name            AS customer_name,
        f.email           AS customer_email,
        f.country,
        p.id              AS product_id,
        p.name            AS product_name,
        f.category,
        f.rating,
        f.message,
        f.sentiment_label,
        ROUND(f.sentiment_compound, 4)  AS sentiment_score,
        f.created_at
      FROM feedbacks f
      LEFT JOIN products p ON f.product_id = p.id
      ORDER BY f.created_at DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/product-trend  → Query 14
exports.getProductTrend = async (req, res) => {
  try {
    const sql = `
      SELECT
        p.name              AS product_name,
        DATE(f.created_at)  AS feedback_date,
        COUNT(*)            AS daily_count,
        ROUND(AVG(f.sentiment_compound), 4) AS avg_sentiment,
        SUM(f.sentiment_label = 'Positive') AS positive_count,
        SUM(f.sentiment_label = 'Negative') AS negative_count,
        SUM(f.sentiment_label = 'Neutral')  AS neutral_count,
        ROUND(AVG(f.rating), 1)             AS avg_rating
      FROM feedbacks f
      INNER JOIN products p ON f.product_id = p.id
      GROUP BY p.name, DATE(f.created_at)
      ORDER BY p.name ASC, feedback_date DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/country-sentiment  → Query 15
exports.getCountrySentiment = async (req, res) => {
  try {
    const sql = `
      SELECT
        COALESCE(f.country, 'Unknown')     AS country,
        p.name                             AS product_name,
        COUNT(*)                           AS total_feedbacks,
        ROUND(AVG(f.sentiment_compound), 4) AS avg_sentiment,
        SUM(f.sentiment_label = 'Positive') AS positive_count,
        SUM(f.sentiment_label = 'Negative') AS negative_count,
        SUM(f.sentiment_label = 'Neutral')  AS neutral_count,
        ROUND(SUM(f.sentiment_label = 'Positive') * 100.0 / COUNT(*), 1) AS positive_pct
      FROM feedbacks f
      LEFT JOIN products p ON f.product_id = p.id
      WHERE f.country IS NOT NULL
      GROUP BY f.country, p.name
      ORDER BY f.country ASC, avg_sentiment DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// STORED PROCEDURES — Endpoints SP4, SP5, SP6
// ============================================================

// GET /api/advanced/sp/product-breakdown/:id?  → SP 5
exports.spProductBreakdown = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10) || 0;
    const [results] = await pool.execute(
      'CALL sp_product_sentiment_breakdown(?)', [productId]
    );
    res.json({ success: true, data: results[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/sp/top-customers  → SP 6
exports.spTopCustomers = async (req, res) => {
  try {
    const [results] = await pool.execute('CALL sp_top_customers()');
    res.json({ success: true, data: results[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================================
// HELPERS — Products list + Flagged feedbacks
// ============================================================

// GET /api/advanced/products  → List all products for dropdown
exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, description FROM products ORDER BY name ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/flagged  → All auto-flagged negative feedbacks
exports.getFlaggedFeedbacks = async (req, res) => {
  try {
    const sql = `
      SELECT
        ff.id           AS flag_id,
        ff.flagged_at,
        ff.reason,
        f.id            AS feedback_id,
        f.name,
        f.email,
        f.country,
        f.message,
        f.sentiment_compound,
        f.created_at
      FROM flagged_feedbacks ff
      INNER JOIN feedbacks f ON ff.feedback_id = f.id
      ORDER BY ff.flagged_at DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/advanced/product-scores  → Live product sentiment scores (from Trigger 3)
exports.getProductScores = async (req, res) => {
  try {
    const sql = `
      SELECT
        pss.*,
        p.name AS product_name
      FROM product_sentiment_scores pss
      JOIN products p ON pss.product_id = p.id
      ORDER BY pss.avg_compound DESC
    `;
    const [rows] = await pool.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};