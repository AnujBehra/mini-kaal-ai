import React, { useState, useEffect } from 'react';
import './App.css';

// Backend API URL - can be set via .env or defaults to localhost:5001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  // State variables
  const [question, setQuestion] = useState('');
  const [currentResponse, setCurrentResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch previous questions on page load
  useEffect(() => {
    fetchHistory();
  }, []);

  // Function to get chat history from the backend
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history`);
      if (!res.ok) {
        throw new Error('Could not fetch history');
      }
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('History fetch error:', err);
      // We don't block the UI if history fails to load initially
    }
  };

  // Function to handle submitting a new question
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic input validation
    if (!question.trim()) {
      setError('Please enter a question before submitting.');
      return;
    }

    // Reset previous errors and start loading
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get guidance.');
      }

      // Update current response display
      setCurrentResponse(data);

      // Add the new response to the top of our history list
      setHistory((prevHistory) => [data, ...prevHistory]);

      // Clear the input box
      setQuestion('');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format timestamp
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Mini KAAL AI</h1>
        <p className="subtitle">Ask any question and receive instant, personalized guidance.</p>
      </header>

      {/* Main Content Layout */}
      <main className="main-content">
        {/* Left / Top Section: Ask Question Form & Current Guidance */}
        <section className="ask-section">
          <div className="card">
            <h2>Ask for Guidance</h2>
            <form onSubmit={handleSubmit} className="question-form">
              <label htmlFor="question-input">Your Question:</label>
              <textarea
                id="question-input"
                rows="3"
                placeholder="e.g. How can I prepare for a junior developer interview?"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
              />

              {/* Error Message */}
              {error && <div className="error-box">{error}</div>}

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Generating Guidance...' : 'Get Guidance'}
              </button>
            </form>
          </div>

          {/* Current Response Display Area */}
          {loading && (
            <div className="card loading-card">
              <div className="spinner"></div>
              <p>KAAL AI is generating your guidance...</p>
            </div>
          )}

          {currentResponse && !loading && (
            <div className="card response-card">
              <div className="response-badge">Latest Guidance</div>
              <h3 className="response-question">Q: {currentResponse.question}</h3>
              <div className="response-body">
                <p>{currentResponse.response}</p>
              </div>
              <span className="timestamp">{formatDate(currentResponse.created_at)}</span>
            </div>
          )}
        </section>

        {/* Right / Bottom Section: Previous Questions & History */}
        <section className="history-section">
          <div className="card history-card">
            <h2>Previous Guidance History</h2>
            {history.length === 0 ? (
              <p className="empty-state">No previous questions yet. Ask your first question!</p>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <strong className="item-question">Q: {item.question}</strong>
                      <span className="timestamp">{formatDate(item.created_at)}</span>
                    </div>
                    <p className="item-response">{item.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Mini KAAL AI Guidance App &bull; Built with React, Node.js &amp; PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
