
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_credits_remaining integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS disease_credits_remaining integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS disease_credits_date date NOT NULL DEFAULT CURRENT_DATE;
