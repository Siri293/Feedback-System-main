const FeedbackModel     = require('../models/feedbackModel');
const { analyzeSentiment } = require('../utils/sentimentAnalyzer');

const FeedbackController = {

  async submitFeedback(req, res, next) {
    try {
      const { name, email, message, category, rating, country, product_id } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false, error: 'Name, email, and message are required.'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false, error: 'Invalid email address.'
        });
      }

      const sentiment = analyzeSentiment(message);

      await FeedbackModel.create({
        name:            name.trim(),
        email:           email.trim().toLowerCase(),
        message:         message.trim(),
        category:        category   || null,
        rating:          parseInt(rating, 10) || 0,
        country:         country    || null,
        product_id:      product_id ? parseInt(product_id, 10) : null,
        sentiment_label: sentiment.label,
        sentiment_score: sentiment.compound,
        positive_score:  sentiment.positive,
        negative_score:  sentiment.negative,
        neutral_score:   sentiment.neutral
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully!',
        sentiment
      });
    } catch (err) { next(err); }
  },

  async getAllFeedback(req, res, next) {
    try {
      const feedbacks = await FeedbackModel.getAll();
      res.json({ success: true, data: feedbacks });
    } catch (err) { next(err); }
  },

  async updateFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { email, message, category, rating, country, product_id } = req.body;

      if (!email || !message) {
        return res.status(400).json({
          success: false, error: 'Email and message are required to update feedback.'
        });
      }

      const existing = await FeedbackModel.getById(id);
      if (!existing) return res.status(404).json({ success: false, error: 'Feedback not found.' });

      if (existing.email.toLowerCase() !== email.trim().toLowerCase()) {
        return res.status(403).json({
          success: false, error: 'You are not authorized to update this feedback.'
        });
      }

      const sentiment = analyzeSentiment(message);

      await FeedbackModel.update(id, {
        message:         message.trim(),
        category:        category   || existing.category,
        rating:          parseInt(rating, 10) || existing.rating || 0,
        country:         country    || existing.country,
        product_id:      product_id ? parseInt(product_id, 10) : existing.product_id,
        sentiment_label: sentiment.label,
        sentiment_score: sentiment.compound,
        positive_score:  sentiment.positive,
        negative_score:  sentiment.negative,
        neutral_score:   sentiment.neutral
      });

      res.json({ success: true, message: 'Feedback updated successfully!', sentiment });
    } catch (err) { next(err); }
  },

  async deleteFeedback(req, res, next) {
    try {
      const { id }    = req.params;
      const { email } = req.body;

      if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

      const existing = await FeedbackModel.getById(id);
      if (!existing) return res.status(404).json({ success: false, error: 'Feedback not found.' });

      if (existing.email.toLowerCase() !== email.trim().toLowerCase()) {
        return res.status(403).json({
          success: false, error: 'You are not authorized to delete this feedback.'
        });
      }

      await FeedbackModel.delete(id);
      res.json({ success: true, message: 'Feedback deleted successfully.' });
    } catch (err) { next(err); }
  },

  async getAnalytics(req, res, next) {
    try {
      const analytics = await FeedbackModel.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) { next(err); }
  }
};

module.exports = FeedbackController;