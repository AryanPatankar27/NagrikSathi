// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Nagrik Prahari Extension installed/updated');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ screenshot: dataUrl });
    });
    return true; // Required for async response
  }
});