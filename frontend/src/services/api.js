import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// ── Core feedback CRUD ────────────────────────────────────────
export const feedbackService = {
  async submit(data) {
    const res = await api.post('/feedback', data);
    return res.data;
  },
  async getAll() {
    const res = await api.get('/feedback');
    return res.data;
  },
  async getAnalytics() {
    const res = await api.get('/feedback/analytics');
    return res.data;
  },
  async update(id, { email, category, rating, country, product_id, message }) {
    const res = await api.put(`/feedback/${id}`, { email, category, rating, country, product_id, message });
    return res.data;
  },
  async delete(id, email) {
    const res = await api.delete(`/feedback/${id}`, { data: { email } });
    return res.data;
  }
};

// ── AI Summary ────────────────────────────────────────────────
export const aiService = {
  async getSummary(feedbacks) {
    const res = await api.post('/ai/summary', { feedbacks });
    return res.data;
  }
};

// ── Export ────────────────────────────────────────────────────
export const exportService = {
  downloadCSV() {
    window.open('/api/export/csv', '_blank');
  },
  async getPDFData() {
    const res = await api.get('/export/pdf-data');
    return res.data;
  }
};

// ── Advanced DB features (all 15 endpoints) ───────────────────
export const advancedService = {
  // Helper
  getProducts:          () => api.get('/advanced/products').then(r => r.data),
  getFlaggedFeedbacks:  () => api.get('/advanced/flagged').then(r => r.data),
  getProductScores:     () => api.get('/advanced/product-scores').then(r => r.data),

  // Views (7, 8, 9)
  getDailyReport:       () => api.get('/advanced/daily-report').then(r => r.data),
  getProductSentiment:  () => api.get('/advanced/product-sentiment').then(r => r.data),
  getCountryFeedback:   () => api.get('/advanced/country-feedback').then(r => r.data),

  // Nested queries (10, 11, 12)
  getTopPositiveProducts:  () => api.get('/advanced/top-positive-products').then(r => r.data),
  getMostActiveCustomers:  () => api.get('/advanced/most-active-customers').then(r => r.data),
  getCategorySentiment:    () => api.get('/advanced/category-sentiment').then(r => r.data),

  // Join queries (13, 14, 15)
  getFeedbackDetails:   () => api.get('/advanced/feedback-details').then(r => r.data),
  getProductTrend:      () => api.get('/advanced/product-trend').then(r => r.data),
  getCountrySentiment:  () => api.get('/advanced/country-sentiment').then(r => r.data),

  // Stored procedures (SP5, SP6)
  spProductBreakdown: (id = 0) => api.get(`/advanced/sp/product-breakdown/${id}`).then(r => r.data),
  spTopCustomers:     ()       => api.get('/advanced/sp/top-customers').then(r => r.data),
};