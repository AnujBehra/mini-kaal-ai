# Mini KAAL AI - Guidance Web Application

A full-stack web application built for the **KAAL AI Technical Evaluation Assignment**. This application allows users to ask questions and receive helpful, personalized guidance. All questions, responses, and timestamps are persisted in a PostgreSQL database and rendered in a clean, chronological history list.

---

##  Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Browser-native `fetch()`)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (`pg` connection pool)
- **Guidance Engine:** Google Gemini AI API (with built-in contextual fallback guidance)



##  Key Features

1. **Question Input & Validation:**
   - Textarea for typing questions with clear placeholder instructions.
   - Client and server-side validation to reject empty or whitespace-only submissions.
   - Disables submit button during processing to prevent accidental duplicate submissions.

2. **Guidance Response Display:**
   - Dedicated card showing the latest submitted question, guidance answer, and formatted date/time.
   - Integrated with Google Gemini AI for live generation, plus a keyword-matching fallback system (career, study, stress, programming, general).

3. **Previous Questions (History):**
   - Automatically loaded via `GET /api/history` on startup.
   - Ordered by newest first (`ORDER BY created_at DESC`).
   - Clean empty state when no history exists.

4. **Loading & Error States:**
   - Clear loading status text while generating answers.
   - Inline alert box when validation fails or if the server is unreachable.

5. **Responsive Design:**
   - 2-column layout on desktop.
   - Stacked single-column layout on mobile devices.

---

##  Step-by-Step Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** installed and running locally on port 5432 (or a hosted PostgreSQL database)

---

### 2. Installation & Run

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/AnujBehra/mini-kaal-ai.git
   cd mini-kaal-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your settings:
   ```env
   PORT=5001
   DATABASE_URL=postgresql://localhost:5432/postgres
   # Optional: Add your Google Gemini API key for live AI answers
   # GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. Open your browser:
   ```
   http://localhost:5001
   ```

> **Note on Database Setup:** The application includes an automated database table check on startup (`CREATE TABLE IF NOT EXISTS queries ...`). You do not need to run manual SQL migration scripts!

---

##  REST API Endpoints

### 1. `GET /api/history`
- **Description:** Returns past questions, guidance responses, and timestamps ordered newest first.
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "question": "What is the best way to study data structures and algorithms?",
      "response": "Create a consistent daily study routine. Use active recall and short practice sessions...",
      "created_at": "2026-10-20T07:30:00.000Z"
    }
  ]
  ```

### 2. `POST /api/ask`
- **Description:** Submits a question, generates guidance, saves to PostgreSQL, and returns the saved row.
- **Request Body:**
  ```json
  {
    "question": "How can I improve my problem-solving skills?"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "question": "How can I improve my problem-solving skills?",
    "response": "Focus on breaking complex problems into smaller, manageable sub-problems...",
    "created_at": "2026-10-20T07:35:00.000Z"
  }
  ```
- **Validation Error (400 Bad Request):**
  ```json
  {
    "error": "Please enter a question before submitting."
  }
  ```

---

##  Deployment on Render

This application is ready to deploy directly on **Render**:

1. **Database:**
   - In Render, click **New +** $\rightarrow$ **PostgreSQL**.
   - Select the **Free** tier and click **Create Database**.
   - Copy the **Internal Database URL** from the database dashboard.

2. **Web Service:**
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository: `mini-kaal-ai`.
   - Set **Build Command:** `npm install`
   - Set **Start Command:** `node backend/server.js`
   - Select the **Free** instance type.
   - Under **Environment Variables**, add:
     - `DATABASE_URL` = *(Your copied database URL)*
     - `GEMINI_API_KEY` = *(Your Gemini API key)*
   - Click **Deploy Web Service**.

Your live URL will be ready at: `https://mini-kaal-ai-xxxx.onrender.com`

---

##  Approach and Challenges Faced

### Approach
1. **Lightweight & Transparent Architecture:** Built with pure HTML, CSS, and Vanilla JavaScript on the frontend, served directly by Express. This eliminates heavy bundlers and complex toolchains, keeping the codebase easy to read, test, and maintain.
2. **Defensive Data Handling:** Applied input validation on both client and server sides. Used parameterized SQL queries (`$1, $2`) via the `pg` connection pool to eliminate SQL injection risks.
3. **Resilient Guidance Engine:** Integrated Google Gemini AI for dynamic generation while providing an automatic fallback to contextual keyword rules so the app always functions even if an API key is not present.
4. **Automated Setup:** Included an `initDB` routine so the database table and timestamps are created automatically on boot without requiring manual SQL commands.

### Challenges Faced & Solutions
1. **macOS Port 5000 Conflict:** On macOS Monterey and later, Apple's AirPlay Receiver reserves port 5000, causing `EADDRINUSE` errors. Resolved by setting the default port to `5001`.
2. **Framework Overhead:** Using heavy frontend frameworks for a small single-page tool adds unnecessary complexity. Replaced with pure semantic HTML5 and Vanilla DOM manipulation.
3. **Cloud Database SSL:** Cloud PostgreSQL providers (Render, Neon) require SSL connections. Added automatic SSL detection in `db.js` so it connects securely in cloud environments while allowing standard local connections.
