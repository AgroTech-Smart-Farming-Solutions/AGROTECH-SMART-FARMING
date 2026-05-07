import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { NotificationBell } from '@/components/ui/NotificationBell';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: 'en' as const, label: 'English', native: 'EN' },
    { code: 'hi' as const, label: 'हिंदी', native: 'हि' },
    { code: 'mr' as const, label: 'मराठी', native: 'म' },
    { code: 'pa' as const, label: 'ਪੰਜਾਬੀ', native: 'ਪੰ' },
    { code: 'ta' as const, label: 'தமிழ்', native: 'த' },
    { code: 'te' as const, label: 'తెలుగు', native: 'తె' },
    { code: 'bn' as const, label: 'বাংলা', native: 'বা' },
    { code: 'gu' as const, label: 'ગુજરાતી', native: 'ગુ' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <>
      <motion.header 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4"
      >
        <div className="clay-dock mx-auto max-w-4xl lg:ml-24 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
          
          {/* Logo Section */}
          <motion.div className="flex items-center gap-2 sm:gap-3 cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => navigate('/')}>
            <motion.div whileHover={{ rotate: 15 }} className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
              <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
              <motion.div className="absolute -top-0.5 -right-0.5" animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles size={10} className="text-accent" />
              </motion.div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-base sm:text-lg text-foreground leading-tight">Agro<span className="text-primary">Tech</span></h1>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5 tracking-wide">{t('smartFarming')}</p>
            </div>
          </motion.div>

          {/* Action Buttons Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Selector */}
            <motion.button onClick={() => setShowLanguages(!showLanguages)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative clay-card px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2">
              <Languages size={14} className="text-primary" />
              <span className="text-xs font-semibold hidden xs:inline">{currentLang?.native}</span>
            </motion.button>
            
            {/* 🚀 Smart Notification Bell (Only keeping the relevant one!) */}
            <NotificationBell />

            {/* Profile Avatar */}
            <motion.button onClick={() => navigate('/profile')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden">
              <div className="w-full h-full clay-card bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile?.name?.charAt(0) || 'U')}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Languages Dropdown Menu */}
      <AnimatePresence>
        {showLanguages && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowLanguages(false)} />
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-16 sm:top-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 lg:left-auto lg:right-24 lg:translate-x-0 z-50 clay-card p-2 min-w-[160px]">
              {languages.map((lang) => (
                <motion.button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLanguages(false); }} whileHover={{ x: 4 }}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${language === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                  <span className="text-sm font-medium">{lang.label}</span>
                  {language === lang.code && <Check size={14} />}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
