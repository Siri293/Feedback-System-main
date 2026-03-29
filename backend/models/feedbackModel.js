const { pool } = require('../config/db');

const FeedbackModel = {

  async create(data) {
    const sql = `
      INSERT INTO feedbacks
        (name, email, message, category, rating, country, product_id,
         sentiment_label, sentiment_compound,
         sentiment_positive, sentiment_negative, sentiment_neutral)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      data.name,
      data.email,
      data.message,
      data.category   || null,
      data.rating     || 0,
      data.country    || null,
      data.product_id || null,
      data.sentiment_label,
      data.sentiment_score,
      data.positive_score,
      data.negative_score,
      data.neutral_score
    ]);
    return result;
  },

  async getAll() {
    const [rows] = await pool.execute(`
      SELECT f.*, p.name AS product_name
      FROM feedbacks f
      LEFT JOIN products p ON f.product_id = p.id
      ORDER BY f.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM feedbacks WHERE id = ?', [id]
    );
    return rows[0] || null;
  },

  async update(id, data) {
    const sql = `
      UPDATE feedbacks SET
        message            = ?,
        category           = ?,
        rating             = ?,
        country            = ?,
        product_id         = ?,
        sentiment_label    = ?,
        sentiment_compound = ?,
        sentiment_positive = ?,
        sentiment_negative = ?,
        sentiment_neutral  = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      data.message,
      data.category    || null,
      data.rating      || 0,
      data.country     || null,
      data.product_id  || null,
      data.sentiment_label,
      data.sentiment_score,
      data.positive_score,
      data.negative_score,
      data.neutral_score,
      id
    ]);
    return result;
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM feedbacks WHERE id = ?', [id]
    );
    return result;
  },

  async getAnalytics() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*)                              AS total,
        AVG(sentiment_compound)               AS avg_sentiment,
        SUM(sentiment_label = 'Positive')     AS positive_count,
        SUM(sentiment_label = 'Negative')     AS negative_count,
        SUM(sentiment_label = 'Neutral')      AS neutral_count
      FROM feedbacks
    `);
    return rows[0];
  }
};

module.exports = FeedbackModel;