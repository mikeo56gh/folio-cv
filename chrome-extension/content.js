// content.js — injected into supported job board pages
// Adds a subtle "Apply with Folio" button alongside native apply buttons

(function() {
  const FOLIO_URL = 'https://folio.cv'

  function getJobData() {
    const url = window.location.href

    if (url.includes('linkedin.com/jobs')) {
      const title = document.querySelector('.job-details-jobs-unified-top-card__job-title, h1.t-24')?.textContent?.trim()
      const company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim()
      const jd = document.querySelector('.jobs-description-content__text')?.innerText?.trim()
      return title ? { title, company, jd } : null
    }

    if (url.includes('indeed.com')) {
      const title = document.querySelector('h1[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim()
      const company = document.querySelector('[data-testid="inlineHeader-companyName"] a')?.textContent?.trim()
      const jd = document.querySelector('#jobDescriptionText')?.innerText?.trim()
      return title ? { title, company, jd } : null
    }

    if (url.includes('reed.co.uk/jobs')) {
      const title = document.querySelector('h1.job-header-title')?.textContent?.trim()
      const company = document.querySelector('.gtm-job-detail-employer')?.textContent?.trim()
      const jd = document.querySelector('.description')?.innerText?.trim()
      return title ? { title, company, jd } : null
    }

    return null
  }

  function injectButton(jobData) {
    if (document.querySelector('#folio-apply-btn')) return // already injected

    const applyBtnSelectors = [
      '.jobs-apply-button--top-card button',
      '[data-testid="indeedApplyButton"]',
      '.apply-button-container button',
      '#apply-button',
    ]

    let anchorEl = null
    for (const sel of applyBtnSelectors) {
      anchorEl = document.querySelector(sel)
      if (anchorEl) break
    }

    if (!anchorEl) return

    const btn = document.createElement('a')
    btn.id = 'folio-apply-btn'
    btn.href = `${FOLIO_URL}/app?jd=${encodeURIComponent((jobData.jd || '').substring(0, 3000))}&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(jobData.title || '')}&from=extension`
    btn.target = '_blank'
    btn.rel = 'noopener'
    btn.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;background:#2d5a3d;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;margin-left:8px">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="7,1 13,7 7,13 7,9 1,9 1,5 7,5"/></svg>
        Apply with Folio
      </span>`

    anchorEl.parentNode?.insertBefore(btn, anchorEl.nextSibling)
  }

  // Wait for page to load then inject
  function tryInject() {
    const jobData = getJobData()
    if (jobData) injectButton(jobData)
  }

  // Run on load and on URL changes (SPA navigation)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject)
  } else {
    tryInject()
  }

  // Observe DOM changes for SPA navigation
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      setTimeout(tryInject, 800) // slight delay for content to load
    }
  }).observe(document.body, { subtree: true, childList: true })
})()
