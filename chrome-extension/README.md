# Folio Chrome Extension

## What it does
- Detects job descriptions on LinkedIn, Indeed, Reed, Glassdoor, Totaljobs, CVLibrary
- Adds an "Apply with Folio" button next to native apply buttons on those sites
- Toolbar popup shows the detected role and lets you open Folio pre-filled with the JD
- Users sign in with their Folio credentials directly in the extension

## Before publishing — two things to update

### 1. Add your domain and Supabase keys to popup.js

Open `popup.js` and update lines 2-4:

```javascript
const FOLIO_URL = 'https://yourdomain.com'        // your actual domain
const SUPABASE_URL = 'https://xxxx.supabase.co'   // from Supabase dashboard
const SUPABASE_ANON_KEY = 'eyJhb...'              // anon key from Supabase
```

### 2. Update the domain in content.js

Line 3 of `content.js`:
```javascript
const FOLIO_URL = 'https://yourdomain.com'
```

## Adding icons

Create three PNG icons and place in `icons/`:
- `icon16.png` — 16x16px
- `icon48.png` — 48x48px  
- `icon128.png` — 128x128px

Use a simple "F" on a dark green (#2d5a3d) background. You can create these free at canva.com or any image editor.

## Installing locally for testing

1. Open Chrome → go to `chrome://extensions`
2. Enable "Developer mode" (toggle top right)
3. Click "Load unpacked"
4. Select this `chrome-extension/` folder
5. The Folio icon appears in your toolbar

Test by going to a LinkedIn job posting — you should see "Apply with Folio" appear next to the native apply button.

## Publishing to Chrome Web Store

1. Go to https://chrome.google.com/webstore/devconsole
2. Pay the one-time $5 developer registration fee
3. Click "New item" → upload a zip of this folder
4. Fill in the store listing (name, description, screenshots)
5. Submit for review — usually approved within 1-3 business days

## Handle the JD params back in your app

The extension opens Folio at:
`/app?jd=JOB_DESCRIPTION&url=JOB_URL&title=ROLE_TITLE&from=extension`

In `app/app/page.tsx` or `AppShell.tsx`, read these params on mount and pre-fill the generate tab:

```typescript
const params = useSearchParams()
useEffect(() => {
  const jd = params.get('jd')
  const jdUrl = params.get('url')
  if (jd) { setJdText(decodeURIComponent(jd)); setTab('generate') }
  if (jdUrl) setJdUrl(decodeURIComponent(jdUrl))
}, [])
```

This is already scaffolded in AppShell.tsx — you just need to uncomment the URL param handling.

## Supported job boards
- LinkedIn Jobs
- Indeed
- Reed.co.uk
- Glassdoor
- Totaljobs
- CVLibrary

To add more boards: update `manifest.json` host_permissions and add a detection block in `content.js` and `popup.js`.
