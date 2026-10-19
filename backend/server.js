const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate guidance response
// If an AI API key is configured, it calls the AI model.
// Otherwise, it returns relevant contextual guidance.
async function generateGuidance(question) {
  // Check if Gemini API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are KAAL AI, a supportive and wise guidance advisor. Give clear, encouraging, and actionable guidance for this user question in 2-4 sentences: "${question}"`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.error('AI API error, using fallback guidance:', err.message);
    }
  }

  // Fallback intelligent guidance responses for demonstration
  const lower = question.toLowerCase();
  if (lower.includes('career') || lower.includes('job') || lower.includes('interview')) {
    return 'Focus on mastering core problem-solving and fundamental skills. Build practical real-world projects to showcase your abilities, and practice communicating your thought process clearly.';
  } else if (lower.includes('study') || lower.includes('exam') || lower.includes('learn')) {
    return 'Break down complex topics into smaller daily milestones. Practice active recall and build sample exercises to reinforce your learning, rather than passively reading.';
  } else if (lower.includes('code') || lower.includes('bug') || lower.includes('programming') || lower.includes('error')) {
    return 'Carefully read the error stack trace to locate the exact file and line. Isolate the problem using print statements or debuggers, and test edge cases step-by-step.';
  } else if (lower.includes('stress') || lower.includes('confused') || lower.includes('tired')) {
    return 'Take a short break to clear your mind. Remember that progress comes with consistency, not speed. Focus on one small task at a time.';
  } else {
    return `KAAL AI Guidance: To address "${question}", define your specific end goal first, outline 2-3 immediate action steps, and execute them consistently. Continuous feedback leads to success.`;
  }
}

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Mini KAAL AI Guidance API is running!' });
});

// API 1: Fetch previous questions and responses (chat history)
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, question, response, created_at FROM queries ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ error: 'Failed to fetch history from database.' });
  }
});

// API 2: Submit a question and get guidance
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Basic input validation
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please enter a question before submitting.' });
    }

    const cleanQuestion = question.trim();

    // Generate guidance response
    const guidanceResponse = await generateGuidance(cleanQuestion);

    // Save question and response to PostgreSQL
    const insertQuery = `
      INSERT INTO queries (question, response)
      VALUES ($1, $2)
      RETURNING id, question, response, created_at;
    `;
    const result = await pool.query(insertQuery, [cleanQuestion, guidanceResponse]);

    // Return the newly created item
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error handling /api/ask:', err.message);
    res.status(500).json({ error: 'Failed to generate guidance. Please try again.' });
  }
});

// Start the server after initializing DB
initDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err.message);
  });
});
