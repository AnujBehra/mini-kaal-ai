# Mini KAAL AI - Guidance Web Application

A full-stack web application built for the **KAAL AI Full Stack Development Assignment**. This app allows users to submit questions and receive personalized guidance responses. All queries and responses are stored in a PostgreSQL database with timestamps and displayed in a chat history section.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite), Pure Responsive CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg` library)
- **Guidance System:** Gemini AI API (with built-in contextual fallback guidance)

---

## 📁 Project Structure

```text
mini-kaal-ai/
├── backend/
│   ├── db.js             # PostgreSQL connection and table initialization
│   ├── server.js         # Express server and API routes (/api/ask, /api/history)
│   ├── .env.example      # Example environment variables
│   └── package.json      # Backend dependencies (express, cors, dotenv, pg)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React component (state, form, response & history)
│   │   ├── App.css       # Clean responsive styles for mobile & desktop
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Global reset and typography
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite configuration
│   └── package.json      # Frontend dependencies (React, Vite)
│
├── .gitignore            # Git ignore rules for node_modules, .env, and dist
└── README.md             # Setup guide, explanation of approach & challenges
```

---

## 🌟 Features

1. **Ask for Guidance:**
   - Text input box for user questions with clear placeholder examples.
   - Submit button that triggers guidance generation.
   - Basic input validation (prevents empty submissions or whitespace).

2. **Guidance Response Display:**
   - Featured card displaying the latest question and the guidance response.
   - Formatted date and time stamp.

3. **Previous Questions (History):**
   - Automatically loads previous guidance history on startup.
   - Ordered by newest first (reverse chronological order).
   - Empty state message when no queries exist.

4. **Loading & Error States:**
   - Animated loading spinner when guidance is being generated.
   - User-friendly error messages if validation fails or server is unreachable.
   - Disabled button state while request is processing to prevent duplicate submissions.

5. **Responsive Design:**
   - 2-column layout on desktop screens.
   - Clean single-column layout on mobile devices.

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** installed and running locally (or a cloud PostgreSQL URL like Supabase/Neon)

---

### 2. Database Setup

1. Make sure your PostgreSQL server is running.
2. Create a database (e.g. `postgres` or `kaal_ai_db`):
   ```bash
   createdb kaal_ai_db
   ```
   *(Note: The application automatically creates the `queries` table on startup if it doesn't already exist! You do not need to manually write any `CREATE TABLE` commands.)*

---

### 3. Backend Setup

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` values:
   ```env
   PORT=5001
   DATABASE_URL=postgresql://localhost:5432/postgres
   # Optional: Add your Gemini API key if you want live AI responses
   # GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   You should see:
   ```text
   Connected to PostgreSQL successfully!
   Table "queries" is ready.
   Server is running on http://localhost:5001
   ```

---

### 4. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints

### 1. `GET /api/history`
- **Description:** Fetches all saved questions and guidance responses.
- **Response:**
  ```json
  [
    {
      "id": 1,
      "question": "How can I prepare for a software developer interview as a fresher?",
      "response": "Focus on mastering core problem-solving and fundamental skills...",
      "created_at": "2026-10-19T08:52:23.581Z"
    }
  ]
  ```

### 2. `POST /api/ask`
- **Description:** Submits a question, generates guidance, and stores it in PostgreSQL.
- **Request Body:**
  ```json
  {
    "question": "How do I debug a tricky coding bug?"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "question": "How do I debug a tricky coding bug?",
    "response": "Carefully read the error stack trace to locate the exact file and line...",
    "created_at": "2026-10-19T09:04:58.566Z"
  }
  ```
- **Validation Error (400 Bad Request):**
  ```json
  {
    "error": "Please enter a question before submitting."
  }
  ```

---

## 💡 Approach and Challenges Faced

### Approach
1. **Simplicity First:** Kept the architecture clean, modular, and easy to explain. Rather than overcomplicating with unnecessary libraries, I used standard Express for the backend and React with standard CSS for the frontend.
2. **PostgreSQL Integration:** Configured a connection pool using `pg`. To make setup effortless for evaluators, I implemented an automatic table creation query (`CREATE TABLE IF NOT EXISTS queries ...`) that runs when the server boots.
3. **Robust Guidance Generator:** The application supports both live AI (via Gemini API) and a built-in contextual fallback system. This guarantees that anyone running or evaluating the application locally gets meaningful guidance without needing to provide an API key.
4. **User Experience:** Added complete loading and error handling states, input trimming validation, and a responsive layout that looks great on mobile and desktop.

### Challenges Faced & Solutions
1. **Port Conflicts on macOS:** macOS Monterey/Ventura/Sonoma reserves port 5000 for the AirPlay Receiver service (`commplex-main`), which causes `EADDRINUSE` errors.
   - *Solution:* Configured the backend to run on port `5001` by default and mapped the frontend `API_URL` to match.
2. **Database Table Synchronization:** In a fresh environment, evaluators might forget to create tables before running the app.
   - *Solution:* Built an automatic table initialization step into `db.js` so the table is created seamlessly upon running `npm start`.
3. **Handling AI Availability:** Relying solely on a third-party AI API key could break the app if an evaluator tests without one.
   - *Solution:* Implemented a dual-mode guidance response generator that uses the API if `GEMINI_API_KEY` is present in `.env`, and smoothly falls back to contextual guidance logic if it is omitted.

---

## 🌐 Live Deployment Guide

- **Database:** Free hosted PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
- **Backend:** Deploy `backend` to [Render](https://render.com) or [Railway](https://railway.app), set `DATABASE_URL` in environment variables.
- **Frontend:** Deploy `frontend` to [Vercel](https://vercel.com) or [Netlify](https://netlify.com), set `VITE_API_URL` to your live backend URL.
