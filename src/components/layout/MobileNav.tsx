import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Play, ScanLine, BookOpen, User, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';

// --- UPDATED NAV ITEMS ---
const navItems = [
  { icon: Home, path: '/', key: 'home', label: 'Home' },
  { icon: Play, path: '/reels', key: 'reels', label: 'Shorts' }, // Added Shorts
  { icon: ScanLine, path: '/scan', key: 'scan', label: 'Dr. Disease', isCenter: true },
  { icon: BookOpen, path: '/ledger', key: 'ledger', label: 'Khata' }, // Added Khata
  { icon: User, path: '/profile', key: 'profile', label: 'Profile' },
];

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-3 pb-3">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl rounded-t-3xl -z-10" />
      <div className="clay-dock px-3 py-2.5 flex items-end justify-around relative">
        <motion.button onClick={toggleTheme} className="absolute -top-12 right-4 w-10 h-10 rounded-full clay-card flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.div animate={{ rotate: theme === 'dark' ? 180 : 0 }} transition={{ type: "spring", stiffness: 200 }}>
            {theme === 'dark' ? <Moon size={18} className="text-accent" /> : <Sun size={18} className="text-accent" />}
          </motion.div>
        </motion.button>

        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || (item.path === '/reels' && location.pathname.startsWith('/reels'));
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <motion.button key={item.path} onClick={() => navigate(item.path)} className="relative -mt-8" whileTap={{ scale: 0.9 }}>
                <motion.div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-primary to-emerald opacity-50 blur-lg"
                  animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] } : {}} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className={cn("relative w-16 h-16 rounded-[20px] flex items-center justify-center shadow-xl", "bg-gradient-to-br from-primary via-primary to-emerald")}
                  whileHover={{ scale: 1.05, y: -4 }} animate={isActive ? { y: -4 } : { y: 0 }}>
                  <Icon size={26} className="text-white drop-shadow-md" />
                </motion.div>
                <span className="text-[9px] font-semibold text-center block mt-1.5 text-primary">{t(item.key) || item.label}</span>
              </motion.button>
            );
          }
          
          return (
            <motion.button key={item.path} onClick={() => navigate(item.path)}
              className={cn("relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300", isActive ? "clay-inset" : "")}
              whileTap={{ scale: 0.9 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <motion.div className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground")}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                <Icon size={22} />
              </motion.div>
              <span className={cn("text-[10px] font-medium transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground")}>{t(item.key) || item.label}</span>
              <AnimatePresence>
                {isActive && <motion.div layoutId="mobileActiveIndicator" className="absolute -bottom-1 w-8 h-1 rounded-full bg-gradient-to-r from-primary to-emerald" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }} />}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};