CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ledger entries" ON public.ledger_entries;
CREATE POLICY "Users can view their own ledger entries" 
ON public.ledger_entries FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ledger entries" ON public.ledger_entries;
CREATE POLICY "Users can insert their own ledger entries" 
ON public.ledger_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ledger entries" ON public.ledger_entries;
CREATE POLICY "Users can update their own ledger entries" 
ON public.ledger_entries FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ledger entries" ON public.ledger_entries;
CREATE POLICY "Users can delete their own ledger entries" 
ON public.ledger_entries FOR DELETE 
USING (auth.uid() = user_id);
