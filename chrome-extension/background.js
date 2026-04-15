// background.js — service worker for Folio extension
// Handles badge updates and message passing

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  const supportedDomains = [
    'linkedin.com/jobs',
    'indeed.com',
    'reed.co.uk/jobs',
    'glassdoor.co.uk',
    'totaljobs.com',
    'cvlibrary.co.uk',
  ]

  const isJobPage = supportedDomains.some(d => tab.url?.includes(d))

  if (isJobPage) {
    // Show green badge dot when on a supported job page
    chrome.action.setBadgeText({ text: '✓', tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#2d5a3d', tabId })
  } else {
    chrome.action.setBadgeText({ text: '', tabId })
  }
})
