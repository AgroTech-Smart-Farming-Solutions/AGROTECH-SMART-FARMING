import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const useRazorpay = () => {
  const { user, refreshProfile } = useAuth();

  const initiatePayment = useCallback(async (planId: 'monthly' | 'yearly') => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Payment service failed to load'); return; }

    try {
      const { data, error } = await supabase.functions.invoke('razorpay-order', {
        body: { plan_id: planId },
      });
      if (error) throw error;

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'KisanAI Pro',
        description: data.plan_name,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
              },
            });
            if (verifyError) throw verifyError;
            toast.success('🎉 Premium activated! Enjoy unlimited access.');
            await refreshProfile();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { email: user?.email || '' },
        theme: { color: '#16a34a' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || 'Failed to initiate payment');
    }
  }, [user, refreshProfile]);

  return { initiatePayment };
};
