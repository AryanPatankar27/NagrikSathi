// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_PAGE_INFO') {
    // Extract relevant page information
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      // Extract text content from main elements
      content: Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
        .map(el => el.textContent.trim())
        .filter(text => text.length > 0)
        .join('\n'),
      // Look for common scam indicators
      hasPaymentForms: !!document.querySelector('form:has(input[type="payment"])'),
      hasUrgencyIndicators: /hurry|limited time|act now|expires|urgent/i.test(document.body.textContent),
      suspiciousLinks: Array.from(document.querySelectorAll('a[href*="bit.ly"], a[href*="tiny.url"]'))
        .map(a => ({ text: a.textContent, href: a.href }))
    };
    
    sendResponse(pageInfo);
  }
});