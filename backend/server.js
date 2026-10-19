// Mini KAAL AI Guidance App - Backend Server
// Developed by Anuj Behra

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Function to generate guidance response
// Supports Google Gemini AI if API key is provided, otherwise returns a dummy response
async function getGuidanceResponse(question) {
  // If GEMINI_API_KEY is available in .env, call Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful guidance mentor. Give a short, encouraging answer (2-3 sentences) to this question: "${question}"`
            }]
          }]
        })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.log('AI API failed, falling back to dummy response:', err.message);
    }
  }

  // Dummy response system based on keywords
  const text = question.toLowerCase();

  if (text.includes('career') || text.includes('job') || text.includes('interview')) {
    return 'Focus on building strong fundamentals, work on hands-on practical projects, and practice explaining your thought process clearly.';
  } else if (text.includes('study') || text.includes('exam') || text.includes('learn')) {
    return 'Break down your topics into small daily goals. Practice active recall and build sample exercises to reinforce your learning.';
  } else if (text.includes('stress') || text.includes('anxiety') || text.includes('worry')) {
    return 'Take a deep breath and take things one step at a time. Focus on what you can control today and maintain a steady routine.';
  } else if (text.includes('code') || text.includes('bug') || text.includes('programming')) {
    return 'Carefully read the error message and trace your data step-by-step. Use console.log to debug and test edge cases.';
  } else {
    return `Here is some guidance: To succeed in "${question}", break it into smaller steps, stay consistent, and keep learning from your mistakes.`;
  }
}

// 1. Route to get previous questions and responses (History)
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM queries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ error: 'Failed to fetch history from database' });
  }
});

// 2. Route to submit a question and get guidance
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Basic input validation
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please enter a question before submitting.' });
    }

    const cleanQuestion = question.trim();

    // Get guidance (AI or dummy response)
    const response = await getGuidanceResponse(cleanQuestion);

    // Save to PostgreSQL database
    const query = 'INSERT INTO queries (question, response) VALUES ($1, $2) RETURNING *';
    const values = [cleanQuestion, response];
    const result = await pool.query(query, values);

    // Send back the newly saved record
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in /api/ask:', err.message);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

// Start the server after initializing database
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
