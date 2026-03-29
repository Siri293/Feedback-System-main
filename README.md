# 💬 Feedback System — AI-Powered Sentiment Analysis

A full-stack feedback management web app with real-time sentiment analysis.

---

## 🎥 Demo
[Click here to watch the demo](https://youtube.com/your-link)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MySQL |
| Sentiment | VADER (Natural) |

---

## ⚙️ Requirements

Make sure you have these installed before running:

- [Node.js](https://nodejs.org/) (v18 or above) — npm comes with it
- [MySQL](https://dev.mysql.com/downloads/) (running locally)

---

## 🚀 How to Run

### Step 1 — Download the project

Click **Code → Download ZIP** on GitHub, extract it, and open the folder in VS Code.

---

### Step 2 — Setup & Run Backend

Open a terminal and run:

```
cd backend
npm install
node server.js
```

Create a `.env` file inside the `backend/` folder with this content:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feedback_db
```

✅ Backend runs on → http://localhost:5000

You should see:
```
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Setup & Run Frontend

Open a **new terminal** and run:

```
cd frontend
npm install
npm run dev
```

✅ Frontend runs on → http://localhost:5173

You should see:
```
Local: http://localhost:5173
```

---

### Step 4 — Open the app

Go to your browser and open:

```
http://localhost:5173
```

> ✅ Works on Windows, Mac, and Linux

---

## ✨ Features

- Submit feedback with name, category, star rating and message
- Real-time AI sentiment analysis (Positive / Negative / Neutral)
- Dashboard to view all feedback with sentiment score and date
- Edit your own feedback (verified by email)
- Delete your own feedback (verified by email)
- Email privacy — emails are never shown publicly
- Full form validation on all fields

---

## 📁 Project Structure

```
feedback-system/
├── backend/
│   ├── config/        # DB connection
│   ├── controllers/   # Business logic
│   ├── models/        # Database queries
│   ├── routes/        # API routes
│   ├── middleware/    # Error handler
│   ├── utils/         # Sentiment analyzer
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # FeedbackForm, FeedbackList, Dashboard
│   │   ├── pages/       # Home
│   │   └── services/    # API calls
│   └── index.html
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/feedback | Get all feedback |
| POST | /api/feedback | Submit new feedback |
| PUT | /api/feedback/:id | Update feedback (email verified) |
| DELETE | /api/feedback/:id | Delete feedback (email verified) |
| GET | /api/feedback/analytics | Get sentiment analytics |

---
# Demo of the web application 
https://youtu.be/R5lJ-OwwoP8


