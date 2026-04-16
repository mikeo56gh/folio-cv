// popup.js — runs when user clicks the Folio extension icon
const FOLIO_URL = 'https://folio.cv' // Change to your domain
const SUPABASE_URL = 'REPLACE_WITH_YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY'

let session = null
let detectedJD = null
let detectedTitle = null

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  // Load saved session
  const stored = await chrome.storage.local.get(['folio_session'])
  session = stored.folio_session || null

  if (session && isSessionValid(session)) {
    showMain()
    scanCurrentTab()
  } else {
    session = null
    showAuth()
  }
}

function isSessionValid(s) {
  if (!s?.access_token) return false
  // Check expiry
  const exp = s.expires_at ? s.expires_at * 1000 : 0
  return exp > Date.now()
}

// ─── AUTH ─────────────────────────────────────────────────────
function showAuth() {
  document.getElementById('auth-view').style.display = 'block'
  document.getElementById('main-view').style.display = 'none'
  document.getElementById('signout-link').style.display = 'none'
}

function showMain() {
  document.getElementById('auth-view').style.display = 'none'
  document.getElementById('main-view').style.display = 'block'
  document.getElementById('signout-link').style.display = 'inline'
  const email = session?.user?.email || ''
  document.getElementById('user-email').textContent = email.split('@')[0]
}

document.getElementById('signin-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const btn = document.getElementById('signin-btn')
  const err = document.getElementById('auth-err')

  err.style.display = 'none'
  btn.innerHTML = '<div class="spinner"></div> Signing in…'
  btn.disabled = true

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Sign in failed')
    session = data
    await chrome.storage.local.set({ folio_session: session })
    showMain()
    scanCurrentTab()
  } catch (e) {
    err.textContent = e.message
    err.style.display = 'block'
    btn.innerHTML = 'Sign in'
    btn.disabled = false
  }
})

document.getElementById('open-signup').addEventListener('click', () => {
  chrome.tabs.create({ url: FOLIO_URL + '/auth' })
})

document.getElementById('signout-link').addEventListener('click', async (e) => {
  e.preventDefault()
  await chrome.storage.local.remove(['folio_session'])
  session = null
  showAuth()
})

// ─── JD DETECTION ─────────────────────────────────────────────
async function scanCurrentTab() {
  const titleEl = document.getElementById('jd-title')
  titleEl.textContent = 'Scanning page…'
  titleEl.className = 'status-val none'

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab.url) {
      titleEl.textContent = 'Navigate to a job posting to get started.'
      return
    }

    // Inject content script to extract JD
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractJobDescription,
    })

    const result = results?.[0]?.result
    if (result?.title) {
      detectedTitle = result.title
      detectedJD = result.jd
      titleEl.textContent = result.title
      titleEl.className = 'status-val detected'

      const applyBtn = document.getElementById('apply-btn')
      applyBtn.disabled = false
      applyBtn.querySelector('#apply-text').textContent = 'Apply with Folio'
    } else {
      titleEl.textContent = 'No job description detected on this page.'
      titleEl.className = 'status-val none'
    }
  } catch (e) {
    titleEl.textContent = 'Could not scan page — try navigating to a job listing.'
    titleEl.className = 'status-val none'
  }
}

// This function is injected into the page — it runs in page context
function extractJobDescription() {
  const url = window.location.href

  // LinkedIn
  if (url.includes('linkedin.com/jobs')) {
    const title = document.querySelector('.job-details-jobs-unified-top-card__job-title, h1.t-24')?.textContent?.trim()
    const company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link')?.textContent?.trim()
    const jdEl = document.querySelector('.jobs-description-content__text, .jobs-description__content')
    const jd = jdEl?.innerText?.trim()
    if (title) return { title: `${title}${company ? ' at ' + company : ''}`, jd: jd || title }
  }

  // Indeed
  if (url.includes('indeed.com')) {
    const title = document.querySelector('h1.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim()
    const company = document.querySelector('[data-testid="inlineHeader-companyName"] a, .icl-u-lg-mr--sm a')?.textContent?.trim()
    const jd = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.innerText?.trim()
    if (title) return { title: `${title}${company ? ' at ' + company : ''}`, jd: jd || title }
  }

  // Reed
  if (url.includes('reed.co.uk/jobs')) {
    const title = document.querySelector('h1.job-header-title, h1[itemprop="title"]')?.textContent?.trim()
    const company = document.querySelector('.gtm-job-detail-employer, .job-header-company a')?.textContent?.trim()
    const jd = document.querySelector('.description, [itemprop="description"]')?.innerText?.trim()
    if (title) return { title: `${title}${company ? ' at ' + company : ''}`, jd: jd || title }
  }

  // Glassdoor
  if (url.includes('glassdoor.co.uk')) {
    const title = document.querySelector('[data-test="job-title"], h1.job-title')?.textContent?.trim()
    const company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim()
    const jd = document.querySelector('[data-test="description"], .jobDescriptionContent')?.innerText?.trim()
    if (title) return { title: `${title}${company ? ' at ' + company : ''}`, jd: jd || title }
  }

  // Totaljobs / CVLibrary — generic fallback
  const genericTitle = document.querySelector('h1')?.textContent?.trim()
  const genericJD = document.querySelector('[class*="description"], [class*="job-detail"], [id*="description"]')?.innerText?.trim()
  if (genericTitle && (genericJD?.length || 0) > 100) {
    return { title: genericTitle, jd: genericJD }
  }

  return null
}

// ─── APPLY ────────────────────────────────────────────────────
document.getElementById('apply-btn').addEventListener('click', async () => {
  if (!detectedJD) return
  const btn = document.getElementById('apply-btn')
  btn.disabled = true
  btn.querySelector('#apply-icon').innerHTML = '<div class="spinner"></div>'
  btn.querySelector('#apply-text').textContent = 'Opening Folio…'

  // Get current tab URL for the JD source
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Encode the JD and open Folio with it pre-filled
  const params = new URLSearchParams({
    jd: detectedJD.substring(0, 3000), // limit URL length
    url: tab.url || '',
    title: detectedTitle || '',
    from: 'extension',
  })

  chrome.tabs.create({ url: `${FOLIO_URL}/app?${params.toString()}` })

  // Reset button
  setTimeout(() => {
    btn.disabled = false
    btn.querySelector('#apply-icon').textContent = '◈'
    btn.querySelector('#apply-text').textContent = 'Apply with Folio'
  }, 1500)
})

document.getElementById('open-folio-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: FOLIO_URL + '/app' })
})

document.getElementById('footer-link').addEventListener('click', (e) => {
  e.preventDefault()
  chrome.tabs.create({ url: FOLIO_URL })
})

// ─── START ────────────────────────────────────────────────────
init()
