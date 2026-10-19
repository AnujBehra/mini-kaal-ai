// Base API URL: relative path when served by Express (both locally & in production)
const API_URL = (window.location.port && window.location.port !== '5001')
  ? 'http://localhost:5001'
  : '';

// Get DOM elements
const questionForm = document.getElementById('question-form');
const questionInput = document.getElementById('question-input');
const submitBtn = document.getElementById('submit-btn');
const errorBox = document.getElementById('error-box');
const loadingBox = document.getElementById('loading-box');
const responseBox = document.getElementById('response-box');
const responseQuestion = document.getElementById('response-question');
const responseText = document.getElementById('response-text');
const responseTime = document.getElementById('response-time');
const historyList = document.getElementById('history-list');

// Format date and time
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML characters to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fetch history from backend API
async function loadHistory() {
  try {
    const res = await fetch(`${API_URL}/api/history`);
    if (!res.ok) {
      throw new Error('Failed to load history');
    }
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    console.error('Error loading history:', err);
    historyList.innerHTML = '<p class="empty-state">Could not load history. Please make sure the server is running.</p>';
  }
}

// Render history list
function renderHistory(items) {
  if (!items || items.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No previous questions found.</p>';
    return;
  }

  historyList.innerHTML = '';
  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-item-header">
        <strong>Question: ${escapeHtml(item.question)}</strong>
        <span class="timestamp">${formatDate(item.created_at)}</span>
      </div>
      <p><strong>Guidance:</strong> ${escapeHtml(item.response)}</p>
    `;
    historyList.appendChild(div);
  });
}

// Handle form submit
questionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();

  // Basic validation
  if (!question) {
    showError('Please enter a question before submitting.');
    return;
  }

  hideError();
  setLoading(true);

  try {
    // Send POST request to backend API
    const res = await fetch(`${API_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit question.');
    }

    // Display latest response
    responseQuestion.textContent = data.question;
    responseText.textContent = data.response;
    responseTime.textContent = formatDate(data.created_at);
    responseBox.style.display = 'block';

    // Clear input field
    questionInput.value = '';

    // Refresh history
    loadHistory();
  } catch (err) {
    console.error('Submit error:', err);
    showError(err.message || 'Cannot connect to backend server.');
  } finally {
    setLoading(false);
  }
});

// Helper: Show error message
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

// Helper: Hide error message
function hideError() {
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}

// Helper: Toggle loading state
function setLoading(isLoading) {
  if (isLoading) {
    loadingBox.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  } else {
    loadingBox.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Question';
  }
}

// Clear error message when user starts typing
questionInput.addEventListener('input', () => {
  if (errorBox.style.display !== 'none') {
    hideError();
  }
});

// Load history on page load
loadHistory();
