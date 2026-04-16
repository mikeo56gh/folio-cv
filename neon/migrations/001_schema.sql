-- ================================================================
-- FOLIO CV BUILDER — NEON SCHEMA
-- Run this in the Neon SQL Editor after enabling Neon Auth
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- USERS
-- Neon Auth stores users in neon_auth.users_sync (read-only view)
-- We mirror to our own users table for plan/billing/usage data
-- user ID matches neon_auth.users_sync.id
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    TEXT PRIMARY KEY,  -- matches neon_auth user ID
  email                 TEXT NOT NULL,
  full_name             TEXT,
  plan                  TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  subscription_status   TEXT DEFAULT 'inactive',
  usage                 JSONB NOT NULL DEFAULT '{}',
  usage_reset_at        TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ────────────────────────────────────────────────────────────────
-- PROFILES — multi-profile CV support
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'Default',
  is_default   BOOLEAN DEFAULT FALSE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- ────────────────────────────────────────────────────────────────
-- CV VERSIONS — saved generated outputs
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_versions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  cv_text      TEXT,
  cover_letter TEXT,
  jd_snippet   TEXT,
  company_name TEXT,
  role_title   TEXT,
  fit_score    INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cv_versions_user_id_idx ON cv_versions(user_id);

-- ────────────────────────────────────────────────────────────────
-- JOB ALERTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  keywords     TEXT[],
  location     TEXT,
  salary_min   INTEGER,
  sector       TEXT,
  seniority    TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_alerts_user_id_idx ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS job_alerts_active_idx ON job_alerts(user_id, is_active) WHERE is_active = TRUE;

-- ────────────────────────────────────────────────────────────────
-- USAGE ANALYTICS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  event      TEXT NOT NULL,
  plan       TEXT,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_events_event_idx ON usage_events(event);
CREATE INDEX IF NOT EXISTS usage_events_created_at_idx ON usage_events(created_at);

-- ────────────────────────────────────────────────────────────────
-- MONTHLY USAGE RESET
-- Schedule with pg_cron if on paid Neon plan:
-- SELECT cron.schedule('0 0 1 * *', $$UPDATE users SET usage = '{}', usage_reset_at = NOW() WHERE usage_reset_at < NOW() - INTERVAL '1 month'$$);
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users SET usage = '{}', usage_reset_at = NOW()
  WHERE usage_reset_at < NOW() - INTERVAL '1 month';
END;
$$;
