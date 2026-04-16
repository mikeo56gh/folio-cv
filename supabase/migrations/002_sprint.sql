-- ================================================================
-- FOLIO — MIGRATION 002: Sprint plan support + alerts table update
-- Run this in Supabase SQL Editor after 001_schema.sql
-- ================================================================

-- Add sprint as a valid plan value (if using CHECK constraints)
-- The users table uses text for plan — no changes needed to schema
-- Just updating the alerts query to include sprint as a valid plan

-- Update the job_alerts table to support sprint users
-- (Sprint users get job alerts — same as Pro/Boost)
-- This is enforced in the API route, not the DB schema

-- Add a helpful index for the weekly cron query
CREATE INDEX IF NOT EXISTS job_alerts_active_idx 
  ON public.job_alerts(user_id, is_active) 
  WHERE is_active = true;

-- Update usage reset function to also handle sprint (3-month cycle)
-- Sprint is a one-time payment for 3 months — Stripe handles expiry
-- When subscription expires, webhook sets plan back to 'free'
-- No special handling needed here

-- Add a view for admin to see plan breakdown (useful for your dashboard)
CREATE OR REPLACE VIEW public.plan_stats AS
SELECT 
  plan,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE subscription_status = 'active') as active_count,
  MAX(updated_at) as last_updated
FROM public.users
GROUP BY plan
ORDER BY 
  CASE plan 
    WHEN 'recruiter' THEN 1 
    WHEN 'boost' THEN 2 
    WHEN 'sprint' THEN 3
    WHEN 'pro' THEN 4 
    ELSE 5 
  END;

-- Allow service role to read the view
GRANT SELECT ON public.plan_stats TO service_role;
