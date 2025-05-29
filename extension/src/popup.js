let currentTab = null;
let screenshot = null;

// View management
const views = {
  initial: document.getElementById('initial-view'),
  preview: document.getElementById('preview-view'),
  success: document.getElementById('success-view'),
  error: document.getElementById('error-view')
};

function showView(viewName) {
  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle('hidden', name !== viewName);
  });
}

// Get current tab information
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  currentTab = tab;
  document.getElementById('urlPreview').textContent = tab.url;
});

// Capture screenshot
document.getElementById('captureBtn').addEventListener('click', async () => {
  try {
    // Capture visible tab
    const imageUrl = await chrome.tabs.captureVisibleTab();
    screenshot = imageUrl;
    
    // Show preview
    document.getElementById('screenshotPreview').src = imageUrl;
    showView('preview');
  } catch (error) {
    console.error('Screenshot error:', error);
    document.getElementById('errorMessage').textContent = 'Failed to capture screenshot';
    showView('error');
  }
});

// Back button handler
document.getElementById('backBtn').addEventListener('click', () => {
  showView('initial');
});

// Retry button handler
document.getElementById('retryBtn').addEventListener('click', () => {
  showView('initial');
});

// Submit report
document.getElementById('submitBtn').addEventListener('click', async () => {
  const category = document.getElementById('category').value;
  const notes = document.getElementById('notes').value;

  if (!category) {
    alert('Please select a category');
    return;
  }

  // Disable submit button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // Prepare the report data
    const reportData = {
      title: currentTab.title,
      description: `URL: ${currentTab.url}\n\nNotes: ${notes}`,
      url: currentTab.url,
      screenshot: screenshot,
      category,
      notes,
      source: 'Chrome Extension',
      dateReported: new Date().toISOString()
    };

    // Send the report
    const response = await fetch('http://localhost:5000/api/reports/extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit report');
    }

    // Show success view
    showView('success');
    
    // Reset form
    document.getElementById('category').value = '';
    document.getElementById('notes').value = '';
    screenshot = null;

  } catch (error) {
    console.error('Submission error:', error);
    document.getElementById('errorMessage').textContent = error.message || 'Failed to submit report. Please try again.';
    showView('error');
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Report';
  }
});