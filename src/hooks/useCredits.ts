import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreditStatus {
  allowed: boolean;
  remaining: number;
  isPremium: boolean;
}

export const useCredits = () => {
  const [loading, setLoading] = useState(false);

  const checkCredits = useCallback(async (type: 'ai' | 'disease'): Promise<CreditStatus> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-credits', {
        body: { type },
      });
      if (error) throw error;
      return data as CreditStatus;
    } catch {
      return { allowed: false, remaining: 0, isPremium: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const deductCredit = useCallback(async (type: 'ai' | 'disease'): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('deduct-credit', {
        body: { type },
      });
      if (error) throw error;
      return data?.success === true;
    } catch {
      return false;
    }
  }, []);

  return { checkCredits, deductCredit, loading };
};
