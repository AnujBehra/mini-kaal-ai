const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100kb' })); // Guard against oversized JSON payloads

// Serve frontend static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Helper function: Input validation
function validateQuestion(question) {
  if (typeof question !== 'string') {
    return 'Invalid question format.';
  }
  const clean = question.trim();
  if (clean.length === 0) {
    return 'Please enter a question before submitting.';
  }
  if (clean.length < 3) {
    return 'Question must be at least 3 characters long.';
  }
  if (clean.length > 1000) {
    return 'Question cannot exceed 1000 characters.';
  }
  return null; // Valid
}

// Helper function: Generate guidance response
async function generateGuidance(question) {
  // If Gemini API key is configured, call the API with a 7-second timeout
  if (process.env.GEMINI_API_KEY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are KAAL AI, a thoughtful guidance assistant. Provide clear, encouraging, and actionable guidance for this question in 2-3 sentences: "${question}"`
                  }
                ]
              }
            ]
          })
        }
      );

      clearTimeout(timeout);
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn('AI API call skipped or timed out, using fallback guidance:', err.message);
    }
  }

  // Fallback contextual guidance
  const lower = question.toLowerCase();
  if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('worry') || lower.includes('fear')) {
    return 'Take a deep breath and pause. Focus on what is within your control today, and break your challenges into smaller, manageable steps.';
  } else if (lower.includes('career') || lower.includes('job') || lower.includes('work') || lower.includes('interview')) {
    return 'Focus on mastering core fundamentals and building hands-on projects. Dedicated preparation and clear communication are key to interview success.';
  } else if (lower.includes('study') || lower.includes('exam') || lower.includes('learn')) {
    return 'Create a consistent daily study routine. Use active recall and short practice sessions rather than cramming all at once.';
  } else if (lower.includes('confused') || lower.includes('decision') || lower.includes('choice')) {
    return 'List your top priorities and evaluate which option aligns best with your long-term goals. Making a conscious decision and taking action brings clarity.';
  } else {
    return `Guidance for "${question}": Clarify your primary goal, outline 2-3 immediate action steps, and execute them consistently.`;
  }
}

// Health check endpoint (checks database connectivity)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1;');
    res.json({
      status: 'ok',
      database: 'connected',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API 1: Fetch previous questions and responses
app.get('/api/history', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, question, response, created_at FROM queries ORDER BY created_at DESC LIMIT 50;'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// API 2: Submit a question and get guidance
app.post('/api/ask', async (req, res, next) => {
  try {
    const { question } = req.body;

    // Strong input validation
    const validationError = validateQuestion(question);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cleanQuestion = question.trim();

    // Generate guidance
    const guidanceResponse = await generateGuidance(cleanQuestion);

    // Save to PostgreSQL using parameterized query
    const insertQuery = `
      INSERT INTO queries (question, response)
      VALUES ($1, $2)
      RETURNING id, question, response, created_at;
    `;
    const result = await pool.query(insertQuery, [cleanQuestion, guidanceResponse]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Server error occurred. Please try again.' });
});

// Start server
let server;
initDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
  });
});

// Graceful shutdown handling
const shutdown = async () => {
  console.log('\nShutting down server gracefully...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }
  try {
    await pool.end();
    console.log('PostgreSQL connection pool closed.');
  } catch (err) {
    console.error('Error closing pool:', err.message);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
