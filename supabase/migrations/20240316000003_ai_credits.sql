-- Add missing ai_credits_date for daily reset tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_credits_date TEXT DEFAULT CURRENT_DATE::text;
