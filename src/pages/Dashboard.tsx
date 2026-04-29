import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { QuickAccessGrid } from '@/components/dashboard/QuickAccessGrid';
import { DailyTip } from '@/components/dashboard/DailyTip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import heroFarmImg from '@/assets/hero-farm.jpg';
import seedlingImg from '@/assets/seedling.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

const FeaturedTip: React.FC<{ seedlingImg: string }> = ({ seedlingImg }) => {
  const { t, language } = useLanguage();
  return (
    <ClayCard className="p-0 overflow-hidden">
      <div className="flex">
        <img src={seedlingImg} alt="Seedling" className="w-28 sm:w-36 h-auto object-cover" />
        <div className="p-4 flex-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary">🌱 {t('dailyTip')}</span>
          <p className="text-sm font-semibold mt-1 text-foreground leading-snug">
            {language === 'hi' ? 'जैविक खाद से उपज 20% बढ़ाएं' : 'Boost yield 20% with organic compost'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'hi' ? 'वर्मीकम्पोस्ट + गोबर की खाद मिलाएं' : 'Mix vermicompost + cow dung manure'}
          </p>
        </div>
      </div>
    </ClayCard>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 sm:space-y-6">
        {/* Hero Banner */}
        <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden">
          <img src={heroFarmImg} alt="Farm landscape" className="w-full h-44 sm:h-56 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <motion.p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Sparkles size={12} className="text-accent" />
              {greeting()},
            </motion.p>
            <motion.h1 className="text-2xl sm:text-3xl font-bold"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="gradient-text">{profile?.name || 'Kisan'}</span>
              <motion.span className="inline-block ml-2"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}>
                👋
              </motion.span>
            </motion.h1>
          </div>
        </motion.div>

        {/* Weather Widget */}
        <motion.div variants={itemVariants}>
          <WeatherWidget />
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div variants={itemVariants}>
          <ClayCard className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald to-primary flex items-center justify-center">
                <TrendingUp size={18} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('todaysMarket')}</p>
                <p className="text-sm font-bold text-foreground">Wheat ₹2,450/q <span className="text-xs" style={{ color: 'hsl(var(--primary))' }}>+2.3%</span></p>
              </div>
            </div>
            <motion.button whileHover={{ x: 3 }} className="flex items-center gap-1 text-xs font-semibold text-primary">
              {t('viewAll')} <ArrowRight size={12} />
            </motion.button>
          </ClayCard>
        </motion.div>

        {/* Featured Tip with Image */}
        <motion.div variants={itemVariants}>
          <FeaturedTip seedlingImg={seedlingImg} />
        </motion.div>

        {/* Quick Access Grid */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">{t('quickAccess')}</h2>
            <span className="text-[10px] text-muted-foreground">6 {t('toolsAvailable')}</span>
          </div>
          <QuickAccessGrid />
        </motion.div>

        {/* Daily Tip Carousel */}
        <motion.div variants={itemVariants}>
          <DailyTip />
        </motion.div>

        <div className="h-4" />
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
