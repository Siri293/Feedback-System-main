# FeedbackIQ — Customer Feedback Intelligence Platform

> An AI-powered full-stack customer feedback management system with real-time sentiment analysis, advanced database features, and Google Gemini AI integration.

![FeedbackIQ Banner](https://img.shields.io/badge/FeedbackIQ-Customer%20Feedback%20Platform-4F46E5?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)

---

## 📌 Project Overview

FeedbackIQ is a comprehensive customer feedback management system built as a full-stack web application. It allows customers to submit feedback with sentiment analysis, and provides administrators with an intelligent dashboard featuring AI-powered summaries, data visualizations, and advanced database analytics.

---

## ✨ Features

### 🧑‍💻 Customer Side
- Submit feedback with name, email, category, country, product, star rating, and message
- Real-time VADER NLP sentiment analysis on submission
- Instant sentiment result display (Positive / Negative / Neutral)
- Confirmation popup before final submission
- Public analytics visible to all users

### 🔐 Admin Dashboard (Password Protected)
- Secure login with username + password
- Full feedback table with edit and delete (ownership verified via email)
- Sentiment Trend Line Chart over time
- Sentiment Distribution Pie Chart
- Word Cloud of most mentioned feedback words
- Export all feedback as CSV or PDF (print-ready)
- Refresh analytics on demand

### 🗄️ Advanced Database Features (15 total)
- **3 Triggers** — Auto-flag negative feedback, auto-categorize by keywords, update product sentiment scores
- **3 Stored Procedures** — Insert feedback with transaction, product-wise breakdown, top customers
- **3 Views** — Daily sentiment report, product-wise analysis, country-wise distribution
- **3 Nested Queries** — Top positive products, most active customers, average sentiment per category
- **3 Join Queries** — Feedback with product info, sentiment trend per product, sentiment by country

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Sentiment Analysis | VADER Sentiment (vader-sentiment npm) |
| Styling | Custom CSS, Inline styles |
| Build Tool | Vite |

---

## 📁 Project Structure

```
FeedbackIQ/
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── controllers/
│   │   ├── feedbackController.js    # Core CRUD logic
│   │   ├── Aicontroller.js          # Gemini AI summary
│   │   ├── Exportcontroller.js      # CSV + PDF export
│   │   └── advancedController.js    # All 15 advanced DB queries
│   ├── middleware/
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   └── feedbackModel.js         # DB queries
│   ├── routes/
│   │   ├── feedbackRoutes.js        # /api/feedback
│   │   ├── Airoutes.js              # /api/ai
│   │   ├── Exportroutes.js          # /api/export
│   │   └── advancedRoutes.js        # /api/advanced
│   ├── utils/
│   │   └── sentimentAnalyzer.js     # VADER wrapper
│   ├── .env                         # Environment variables (not committed)
│   ├── package.json
│   └── server.js                    # Express app entry point
│
├── database/
│   ├── schema.sql                   # Base schema + seed data
│   └── advanced_db.sql              # Triggers, procedures, views
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLogin.jsx       # Password-protected login
│   │   │   ├── Dashboard.jsx        # Admin dashboard
│   │   │   ├── FeedbackForm.jsx     # Submission form
│   │   │   ├── FeedbackList.jsx     # Table with edit/delete
│   │   │   ├── Wordcloud.jsx        # Word cloud visualization
│   │   │   ├── Exportbuttons.jsx    # CSV + PDF export buttons
│   │   │   └── Publicanalytics.jsx  # Public stats section
│   │   ├── pages/
│   │   │   └── Home.jsx             # Landing page
│   │   ├── services/
│   │   │   └── api.js               # Axios service layer
│   │   ├── App.jsx                  # Router + navbar
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/Siri293/FeedbackIQ.git
cd FeedbackIQ
```

### 2. Set up the database
```bash
# Run base schema (creates tables + seed data)
mysql -u root -p < database/schema.sql

# Run advanced features (triggers, procedures, views)
mysql -u root -p feedback_db < database/advanced_db.sql
```

### 3. Configure backend environment
Create `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feedback_db
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Install and run backend
```bash
cd backend
npm install
npm run dev
```

### 5. Install and run frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Open the app
```
Frontend  →  http://localhost:5173
Backend   →  http://localhost:5000
```

---

## 🔐 Admin Access

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `feedbackiq2026` |

> To change credentials, edit `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `frontend/src/components/AdminLogin.jsx`

---

## 🌐 API Endpoints

### Core Feedback
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/feedback` | Get all feedback |
| POST | `/api/feedback` | Submit new feedback |
| PUT | `/api/feedback/:id` | Update feedback (email verified) |
| DELETE | `/api/feedback/:id` | Delete feedback (email verified) |
| GET | `/api/feedback/analytics` | Get sentiment summary |

### AI & Export
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/summary` | Generate Gemini AI summary |
| GET | `/api/export/csv` | Download CSV |
| GET | `/api/export/pdf-data` | Get PDF report data |

### Advanced Database (15 endpoints)
| Method | Endpoint | Feature |
|---|---|---|
| GET | `/api/advanced/daily-report` | View 7 — Daily sentiment |
| GET | `/api/advanced/product-sentiment` | View 8 — Product analysis |
| GET | `/api/advanced/country-feedback` | View 9 — Country distribution |
| GET | `/api/advanced/top-positive-products` | Query 10 — Nested query |
| GET | `/api/advanced/most-active-customers` | Query 11 — Nested query |
| GET | `/api/advanced/category-sentiment` | Query 12 — Nested query |
| GET | `/api/advanced/feedback-details` | Query 13 — Join query |
| GET | `/api/advanced/product-trend` | Query 14 — Join query |
| GET | `/api/advanced/country-sentiment` | Query 15 — Join query |
| GET | `/api/advanced/flagged` | Trigger 1 results |
| GET | `/api/advanced/product-scores` | Trigger 3 results |
| GET | `/api/advanced/sp/product-breakdown/:id` | Stored Procedure 5 |
| GET | `/api/advanced/sp/top-customers` | Stored Procedure 6 |

---

## 🗄️ Database Schema

### Tables
- **`products`** — Product catalog (Product, Service, Website, Support)
- **`feedbacks`** — Main feedback entries with sentiment scores, country, rating, product FK
- **`flagged_feedbacks`** — Auto-populated by Trigger 1 for negative feedback
- **`product_sentiment_scores`** — Rolling scores auto-updated by Trigger 3

### Triggers
| Name | Event | Action |
|---|---|---|
| `trg_flag_negative` | AFTER INSERT | Flags negative feedback automatically |
| `trg_auto_categorize` | BEFORE INSERT | Assigns category from message keywords |
| `trg_update_product_sentiment` | AFTER INSERT | Updates product rolling sentiment score |

### Stored Procedures
| Name | Description |
|---|---|
| `sp_insert_feedback` | Transactional feedback insert |
| `sp_product_sentiment_breakdown` | Product-wise analytics (filter by ID or all) |
| `sp_top_customers` | Top 5 customers by feedback count |

### Views
| Name | Description |
|---|---|
| `vw_daily_sentiment_report` | Daily grouped sentiment breakdown |
| `vw_product_sentiment` | Product-wise aggregated analysis |
| `vw_country_feedback` | Country-wise feedback distribution |

---

---

## 📄 License

This project is built for academic and portfolio purposes.

---

## 👩‍💻 Author

**Mandapati Siri Chandana**
B.Tech Data Science — Vignan's Lara Institute of Technology and Science, Andhra Pradesh

[![LinkedIn]([https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/your-profile](https://www.linkedin.com/in/mandapati-sirichandana-175b8a367/))
[![GitHub](https://img.shields.io/badge/GitHub-Siri293-181717?style=flat-square&logo=github)](https://github.com/Siri293)

---

*Built with React • Node.js • MySQL • VADER NLP *
