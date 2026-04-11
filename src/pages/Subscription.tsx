import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Leaf, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRazorpay } from '@/hooks/useRazorpay';

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: [
      '5 AI assistant messages',
      '1 disease scan per day',
      'Basic weather alerts',
      'Mandi prices',
      'Community support',
    ],
    limitations: [
      'Limited AI credits',
      'Limited disease scans',
    ],
    popular: false,
  },
  {
    id: 'monthly' as const,
    name: 'Pro Monthly',
    price: '₹99',
    period: '/month',
    features: [
      'Unlimited AI assistant',
      'Unlimited disease scans',
      'Advanced AI soil analysis',
      'Personalized scheme matching',
      'Price predictions',
      'Priority support',
    ],
    limitations: [],
    popular: true,
  },
  {
    id: 'yearly' as const,
    name: 'Pro Yearly',
    price: '₹799',
    period: '/year',
    originalPrice: '₹1,188',
    savings: 'Save ₹389',
    features: [
      'Everything in Pro Monthly',
      'Farm visit by agronomist (1/year)',
      'Premium crop insurance info',
      'Custom farm dashboard',
      'Family account (3 members)',
    ],
    limitations: [],
    popular: false,
  },
];

const Subscription: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { initiatePayment } = useRazorpay();
  const isPremium = profile?.subscription === 'premium' || profile?.subscription === 'pro';

  const handleSubscribe = (planId: string) => {
    if (planId === 'free' || isPremium) return;
    initiatePayment(planId as 'monthly' | 'yearly');
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-3xl bg-accent mx-auto mb-4 flex items-center justify-center">
            <Crown size={32} className="text-accent-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">
            {isPremium ? '🎉 You are Pro!' : 'Upgrade Your Farm'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isPremium ? 'Enjoy unlimited access to all features' : 'Get advanced AI-powered tools for better yields'}
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan, index) => {
            const isCurrentPlan = (plan.id === 'free' && !isPremium) || (plan.id !== 'free' && isPremium);
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ClayCard className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-2xl">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {plan.id !== 'free' && <Sparkles size={18} className="text-accent" />}
                        {plan.name}
                      </h3>
                      {plan.savings && <span className="text-xs text-primary font-semibold">{plan.savings}</span>}
                    </div>
                    <div className="text-right">
                      {plan.originalPrice && <span className="text-sm text-muted-foreground line-through block">{plan.originalPrice}</span>}
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 flex items-center justify-center">×</span>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>
                  <ClayButton
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.id === 'free' ? 'Free Plan' : `Subscribe - ${plan.price}`}
                  </ClayButton>
                </ClayCard>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits */}
        <ClayCard className="text-center">
          <Leaf size={32} className="text-primary mx-auto mb-3" />
          <h3 className="font-bold mb-2">Why Go Pro?</h3>
          <p className="text-sm text-muted-foreground">
            Pro farmers report 20% higher yields and 15% lower costs on average. 
            Our AI analyzes your specific conditions to give personalized recommendations.
          </p>
        </ClayCard>

        <p className="text-center text-xs text-muted-foreground">
          Powered by Razorpay • 7-day money-back guarantee • Cancel anytime
        </p>
      </motion.div>
    </AppLayout>
  );
};

export default Subscription;
