# Mini KAAL AI - Guidance Web Application

A lightweight, clean full-stack web application built for the **KAAL AI Full Stack Development Assignment**.

This application allows users to ask questions and receive thoughtful, calming guidance inspired by timeless wisdom. All questions and responses are stored in a PostgreSQL database with timestamps and displayed in reverse-chronological order.

Built with **pure HTML, CSS, Vanilla JavaScript, Node.js, Express, and PostgreSQL** — strictly without any frameworks, build tools, or complex abstractions.

---

## 🏛️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                        Frontend                        │
│                 HTML + CSS + JavaScript                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                        REST API                        │
│               JavaScript fetch() requests              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                        Backend                         │
│                   Node.js + Express.js                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                       PostgreSQL                       │
│              Questions, answers, timestamps            │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (No React, No Vite, No build step)
- **API Communication:** Browser-native `fetch()` requests
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (`pg` connection pool)
- **Guidance System:** KAAL AI wisdom engine (Gemini API integration with contextual fallback)

---

## 📁 Clean Folder Structure

```text
mini-kaal-ai/
├── backend/
│   ├── db.js             # PostgreSQL connection pool & auto table initialization
│   ├── server.js         # Express server serving static frontend & REST API
│   ├── .env.example      # Example environment variables
│   ├── .env              # Local environment variables
│   └── package.json      # Backend dependencies (express, cors, dotenv, pg)
│
├── frontend/
│   ├── index.html        # Clean, semantic HTML5 structure
│   ├── style.css         # Responsive styling with KAAL AI navy & gold theme
│   └── script.js         # Vanilla JavaScript handling DOM & fetch() calls
│
├── package.json          # Root convenience script ("npm start")
├── .gitignore            # Ignores node_modules, .env, and OS logs
└── README.md             # Complete setup guide, architecture & submission text
```

---

## 🌟 Key Features

1. **Question Input & Validation:**
   - Textarea for typing questions with placeholder guidance.
   - Prevents empty or whitespace-only submissions with clear error alerts.
   - Disables submit button during processing to prevent accidental double-submits.

2. **Instant Guidance Generation:**
   - Features latest guidance card with question, response, and formatted timestamp.
   - Mindful guidance aligned with KAAL AI's mental wellness philosophy (support for live Gemini API key + built-in fallback logic).

3. **Previous Guidance (History):**
   - Automatically fetched using `fetch('/api/history')` on page load.
   - Ordered by newest first (reverse chronological order).
   - Empty state message if no questions exist.

4. **Loading & Error Handling:**
   - Animated spinner while waiting for guidance response.
   - Clear red error notification box if validation fails or server is unreachable.

5. **Responsive Design:**
   - 2-column layout on desktop screens.
   - Clean stacked layout on mobile devices.

---

## 🚀 Step-by-Step Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** running locally on port 5432 (or a hosted cloud PostgreSQL URL)

---

### 2. Database Setup

Make sure your PostgreSQL server is running.
The application connects to `postgresql://localhost:5432/postgres` by default.

> **Zero Manual SQL Setup:** The app automatically creates the `queries` table on boot (`CREATE TABLE IF NOT EXISTS queries ...`). You do NOT need to run any manual migration scripts!

---

### 3. Run the Application (Single Command!)

From the root project folder:

1. Install backend dependencies (if not already installed):
   ```bash
   cd backend
   npm install
   cd ..
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:5001
   ```

Because Express directly serves the `frontend/` folder, both the frontend UI and backend REST API run together seamlessly on **`http://localhost:5001`** with zero build tools!

---

## 📡 REST API Documentation

### 1. `GET /api/history`
- **Method:** `GET`
- **Description:** Returns all previous questions, answers, and timestamps ordered by newest first.
- **Example Response:**
  ```json
  [
    {
      "id": 1,
      "question": "How do I find clarity when faced with two difficult choices?",
      "response": "Whenever clarity feels distant, quiet the noise and look inward...",
      "created_at": "2026-10-19T10:09:14.707Z"
    }
  ]
  ```

### 2. `POST /api/ask`
- **Method:** `POST`
- **Description:** Submits a question, generates guidance, saves to PostgreSQL, and returns the created record.
- **Request Body:**
  ```json
  {
    "question": "How can I handle stress and worry about my career?"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "id": 2,
    "question": "How can I handle stress and worry about my career?",
    "response": "Take a deep breath and pause. As timeless wisdom teaches...",
    "created_at": "2026-10-19T10:10:00.000Z"
  }
  ```
- **Validation Error (400 Bad Request):**
  ```json
  {
    "error": "Please enter a question before submitting."
  }
  ```

---

## 💡 Explanation of Approach & Challenges

### Approach
1. **True Simplicity:** Built without bulky frameworks. Plain HTML, CSS, and Vanilla JavaScript make the codebase 100% transparent, lightweight, and easy to explain line-by-line.
2. **Unified Single-Server Deployment:** Configured Express to serve the static frontend files directly. This eliminates the need for separate dev servers (like Vite/Webpack) and avoids any CORS issues in production.
3. **Database Automation:** Automatic table creation in `db.js` ensures anyone who clones the repository can run `npm start` immediately without manually creating tables in PostgreSQL.
4. **Resilient Guidance Engine:** The guidance generator seamlessly supports live AI models if `GEMINI_API_KEY` is present in `.env`, while providing high-quality contextual fallback guidance if run without an API key.

### Challenges Faced & Solutions
1. **macOS Port 5000 Conflict:** On macOS Monterey and later, Apple's AirPlay Receiver reserves port 5000 (`commplex-main`), triggering `EADDRINUSE`.
   - *Solution:* Set the backend port to `5001`.
2. **Framework Overhead Removal:** Modern setups often introduce complex toolchains that make basic CRUD apps hard to inspect.
   - *Solution:* Replaced Vite and React with semantic HTML5 and Vanilla DOM manipulation using standard `document.getElementById` and native `fetch()`.
3. **Smooth Local Evaluation:** Evaluators often don't have time to create database tables or configure third-party API keys.
   - *Solution:* Automated table creation and dual-mode AI/fallback guidance ensure the app works flawlessly out of the box.

---

## 🌐 Deployment Options

- **Database:** Free hosted PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
- **Web Service:** Deploy the full repo to [Render](https://render.com) or [Railway](https://railway.app). Set build command to `cd backend && npm install` and start command to `node backend/server.js`.
