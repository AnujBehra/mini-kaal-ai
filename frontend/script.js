// Base API URL
// If running on port 5001 directly, use relative path. Otherwise default to localhost:5001
const API_URL = window.location.port === '5001' ? '' : 'http://localhost:5001';

// DOM Elements
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

// Helper function to format timestamp
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to fetch previous questions from the backend API
async function fetchHistory() {
  try {
    const res = await fetch(`${API_URL}/api/history`);
    if (!res.ok) {
      throw new Error('Failed to load history');
    }
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    console.error('History fetch error:', err);
    historyList.innerHTML = '<p class="empty-state">Could not load history. Please ensure backend is running.</p>';
  }
}

// Function to render history items in the DOM
function renderHistory(items) {
  if (!items || items.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No previous questions yet. Ask your first question above!</p>';
    return;
  }

  historyList.innerHTML = '';
  items.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';
    itemDiv.innerHTML = `
      <div class="history-item-header">
        <strong class="item-question">Q: ${escapeHtml(item.question)}</strong>
        <span class="timestamp">${formatDate(item.created_at)}</span>
      </div>
      <p class="item-response">${escapeHtml(item.response)}</p>
    `;
    historyList.appendChild(itemDiv);
  });
}

// Helper to escape HTML and prevent XSS injection
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Form submit event handler
questionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();

  // Basic input validation
  if (!question) {
    showError('Please enter a question or reflection before asking.');
    return;
  }

  // Clear previous error
  hideError();

  // Set loading state
  setLoading(true);

  try {
    // Send POST request to backend REST API using fetch()
    const res = await fetch(`${API_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate guidance.');
    }

    // Display the latest guidance card
    responseQuestion.textContent = `Q: ${data.question}`;
    responseText.textContent = data.response;
    responseTime.textContent = formatDate(data.created_at);
    responseBox.style.display = 'block';

    // Clear input field
    questionInput.value = '';

    // Reload history to include the new response at the top
    fetchHistory();
  } catch (err) {
    console.error('Submit error:', err);
    showError(err.message || 'Cannot reach the backend server. Please make sure it is running.');
  } finally {
    setLoading(false);
  }
});

// Helper functions for UI states
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function hideError() {
  errorBox.textContent = '';
  errorBox.style.display = 'none';
}

function setLoading(isLoading) {
  if (isLoading) {
    loadingBox.style.display = 'flex';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Reflecting on your question...';
  } else {
    loadingBox.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Seek Guidance';
  }
}

// Clear error on input typing
questionInput.addEventListener('input', () => {
  if (errorBox.style.display !== 'none') {
    hideError();
  }
});

// Load history when page opens
fetchHistory();
