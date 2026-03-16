import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, ScanLine, Play, User, Wrench, TrendingUp, Moon, Sun, ChevronLeft, ChevronRight, Languages, Search, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import logoImg from '@/assets/logo.png';

const navItems = [
  { icon: Home, path: '/', key: 'home', label: 'Dashboard' },
  { icon: MessageCircle, path: '/chat', key: 'chat', label: 'AI Chat', badge: 'AI' },
  { icon: ScanLine, path: '/scan', key: 'scan', label: 'Dr. Disease' },
  { icon: Search, path: '/search', key: 'search', label: 'Search' },
  { icon: Mail, path: '/messages', key: 'messages', label: 'Messages' },
  { icon: Wrench, path: '/tools', key: 'tools', label: 'Smart Tools' },
  { icon: TrendingUp, path: '/prices', key: 'prices', label: 'Prices' },
  { icon: Play, path: '/reels', key: 'reels', label: 'Agri Shorts' },
  { icon: User, path: '/profile', key: 'profile', label: 'Profile' },
];

export const FloatingDock: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const languages = ['en', 'hi', 'mr', 'pa', 'ta', 'te', 'bn', 'gu'] as const;
  const languageNames: Record<string, string> = { en: 'English', hi: 'हिंदी', mr: 'मराठी', pa: 'ਪੰਜਾਬੀ', ta: 'தமிழ்', te: 'తెలుగు', bn: 'বাংলা', gu: 'ગુજરાતી' };

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(language as any);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }} className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <motion.div className="relative rounded-[1.75rem] bg-card/95 backdrop-blur-xl border border-border/50 p-3 flex flex-col gap-1.5"
        animate={{ width: isExpanded ? 200 : 64 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
        style={{ boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.15), 0 4px 16px -4px rgba(0,0,0,0.1)' }}>
        
        <div className="flex items-center gap-2.5 px-1 mb-1">
          <motion.div whileHover={{ rotate: 15, scale: 1.05 }} className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shrink-0">
            <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
          </motion.div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                <h2 className="font-extrabold text-sm text-foreground whitespace-nowrap">Agro<span className="text-primary">Tech</span></h2>
                <p className="text-[9px] text-muted-foreground whitespace-nowrap">{t('smartFarming')}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button onClick={() => setIsExpanded(!isExpanded)} className="ml-auto w-7 h-7 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </motion.button>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex flex-col gap-0.5 py-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.button key={item.path} onClick={() => navigate(item.path)}
                className={cn("relative w-full h-11 rounded-xl flex items-center gap-3 px-3 transition-all duration-200 group",
                  isActive ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )} whileHover={{ x: isActive ? 0 : 2 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                {isActive && <motion.div layoutId="sidebarActiveIndicator" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-primary to-emerald" />}
                <div className="min-w-[20px] flex justify-center relative shrink-0">
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && !isExpanded && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-2">
                      <span className="px-1 py-0.5 text-[7px] font-bold rounded bg-primary text-primary-foreground">{item.badge}</span>
                    </motion.span>
                  )}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className={cn("text-[13px] whitespace-nowrap", isActive ? "font-bold" : "font-medium")}>{t(item.key)}</span>
                      {item.badge && <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-md bg-primary/15 text-primary">{item.badge}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex flex-col gap-1 pt-1">
          <motion.button onClick={cycleLanguage} className="w-full h-10 rounded-xl flex items-center gap-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" whileTap={{ scale: 0.97 }}>
            <Languages size={18} className="shrink-0" />
            <AnimatePresence>
              {isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium whitespace-nowrap">{languageNames[language]}</motion.span>}
            </AnimatePresence>
          </motion.button>
          <motion.button onClick={toggleTheme} className="w-full h-10 rounded-xl flex items-center gap-3 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" whileTap={{ scale: 0.97 }}>
            <motion.div className="shrink-0" animate={{ rotate: theme === 'dark' ? 180 : 0 }} transition={{ type: "spring", stiffness: 200 }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
            <AnimatePresence>
              {isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium whitespace-nowrap">{theme === 'dark' ? t('darkMode') : t('lightMode')}</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>

        {user && (
          <>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <motion.div className="flex items-center gap-2.5 px-1 py-1 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate('/profile')} whileTap={{ scale: 0.97 }}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-emerald/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20 overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile?.name?.charAt(0) || 'U')}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-foreground truncate">{profile?.name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{(profile as any)?.username ? `@${(profile as any).username}` : (profile?.location || '')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
