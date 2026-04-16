# Folio — Neon Migration Guide

## What changed from Supabase

| Before | After |
|--------|-------|
| `@supabase/supabase-js` | `@neondatabase/neon-js` + `@neondatabase/serverless` |
| Supabase Auth | Neon Auth (Better Auth under the hood) |
| Supabase query builder | Raw SQL via `lib/db.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | `DATABASE_URL` + `NEXT_PUBLIC_NEON_AUTH_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Not needed — JWT verified server-side |
| `supabase/migrations/` | `neon/migrations/` |

---

## Step 1 — Create Neon project

1. Go to **neon.tech** → sign up or log in
2. Click **New Project**
3. Name it `folio-cv`, region `AWS US East` or `AWS EU West`
4. Click **Create Project**
5. Copy the **Connection string** (pooled) → save as `DATABASE_URL`

---

## Step 2 — Enable Neon Auth

1. In your Neon project dashboard, look for **Auth** in the left sidebar
2. Click **Enable Auth**
3. Enable **Google OAuth** — click the Google provider toggle
4. For Google OAuth credentials, either:
   - Use the **shared test credentials** Neon provides (fine for dev/testing)
   - Or add your own Google OAuth client ID/secret from Google Cloud Console
5. Copy the **Auth URL** → save as `NEXT_PUBLIC_NEON_AUTH_URL`
   - It looks like `https://your-project-id.neon.tech/auth`

---

## Step 3 — Run the schema

1. In Neon dashboard → **SQL Editor** → **New query**
2. Paste the contents of `neon/migrations/001_schema.sql`
3. Click **Run**
4. You should see: `CREATE TABLE` × 5, `CREATE INDEX` × 6

---

## Step 4 — Update Railway environment variables

Remove the old Supabase variables and add the new Neon ones:

**Remove:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Add:**
- `DATABASE_URL` — your Neon pooled connection string
- `NEXT_PUBLIC_NEON_AUTH_URL` — your Neon Auth URL

**Keep everything else the same:**
- `ANTHROPIC_API_KEY`
- `STRIPE_*` keys
- `ADZUNA_*` keys
- `RESEND_API_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

---

## Step 5 — Upload to GitHub and redeploy

Same as before — drag all contents of the `folio-v2` folder into GitHub, commit, Railway auto-deploys.

---

## How Neon Auth works in this app

1. **Sign up / sign in** — handled by `@neondatabase/neon-js` auth client on the frontend
2. **Sessions** — Neon Auth issues a JWT token stored in the browser
3. **API routes** — the token is sent as `Authorization: Bearer <token>` header
4. **Verification** — `lib/auth.ts` decodes the JWT to get `userId` and `email`
5. **User records** — `getOrCreateUser()` creates a row in your `users` table on first sign in (synced from Neon Auth)

No webhook setup required. No service role key needed. The JWT contains everything the API needs.

---

## Database branching (bonus)

One of the best Neon features — create a development branch:

1. Neon dashboard → **Branches** → **New branch** from `main`
2. Name it `dev`
3. Use the `dev` branch connection string as `DATABASE_URL` in your local `.env.local`
4. Your dev database is a full copy of production — same schema, isolated data
5. Delete it when done — zero cleanup needed

---

## Migrating existing Supabase data (if you have users)

If you already have users in Supabase and want to keep their data:

1. Export from Supabase: Dashboard → Settings → Database → Backups → Download
2. Import to Neon: SQL Editor → paste the INSERT statements for `users`, `profiles`, `cv_versions` tables
3. Note: Supabase auth users can't be migrated directly — they'll need to reset their password or re-register via Neon Auth

For a fresh Folio with no existing users, no migration needed.
