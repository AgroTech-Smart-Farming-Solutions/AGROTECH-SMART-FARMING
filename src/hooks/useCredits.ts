import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreditStatus {
  allowed: boolean;
  remaining: number;
  isPremium: boolean;
}

export const useCredits = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkCredits = useCallback(async (type: 'ai' | 'disease'): Promise<CreditStatus> => {
    if (!user) return { allowed: false, remaining: 0, isPremium: false };
    setLoading(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (!profile) throw new Error('Profile not found');

      const isPremium = profile.subscription === 'premium';
      if (isPremium) return { allowed: true, remaining: 9999, isPremium: true };

      const today = new Date().toISOString().split('T')[0];
      const dateField = type === 'ai' ? 'ai_credits_date' : 'disease_credits_date';
      const remainingField = type === 'ai' ? 'ai_credits_remaining' : 'disease_credits_remaining';
      const defaultCredits = type === 'ai' ? 5 : 1;

      let remaining = profile[remainingField as keyof typeof profile] as number;
      const lastDate = profile[dateField as keyof typeof profile] as string;

      if (lastDate !== today) {
        remaining = defaultCredits;
        await supabase.from('profiles').update({
          [dateField]: today,
          [remainingField]: remaining
        }).eq('user_id', user.id);
      }

      return { allowed: remaining > 0, remaining, isPremium };
    } catch (e) {
      console.error('Credit check error:', e);
      return { allowed: false, remaining: 0, isPremium: false };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deductCredit = useCallback(async (type: 'ai' | 'disease'): Promise<boolean> => {
    if (!user) return false;
    try {
      const status = await checkCredits(type);
      if (!status.allowed) return false;
      if (status.isPremium) return true;

      const remainingField = type === 'ai' ? 'ai_credits_remaining' : 'disease_credits_remaining';
      await supabase.from('profiles').update({
        [remainingField]: status.remaining - 1
      }).eq('user_id', user.id);
      
      return true;
    } catch {
      return false;
    }
  }, [user, checkCredits]);

  return { checkCredits, deductCredit, loading };
};
