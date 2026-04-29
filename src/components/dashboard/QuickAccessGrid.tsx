import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  ScanLine, 
  BookOpen, 
  FileText, 
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const quickAccessItems = [
  { 
    icon: MessageCircle, 
    key: 'aiAssistant', 
    path: '/chat',
    gradient: 'from-primary to-emerald',
    bgGlow: 'bg-primary/20',
    description: 'Ask AI anything',
    badge: 'AI',
  },
  { 
    icon: ScanLine, 
    key: 'cropDoctor', 
    path: '/scan',
    gradient: 'from-emerald to-primary',
    bgGlow: 'bg-emerald/20',
    description: 'AI disease detection',
    badge: 'NEW',
  },
  { 
    icon: BookOpen, 
    key: 'ledger', 
    path: '/ledger',
    gradient: 'from-secondary to-secondary/70',
    bgGlow: 'bg-secondary/20',
    description: 'Track expenses',
  },
  { 
    icon: FileText, 
    key: 'schemes', 
    path: '/schemes',
    gradient: 'from-accent to-accent/70',
    bgGlow: 'bg-accent/20',
    description: 'Govt. subsidies',
  },
  { 
    icon: Calendar, 
    key: 'cropCalendar', 
    path: '/calendar',
    gradient: 'from-primary/80 to-primary',
    bgGlow: 'bg-primary/15',
    description: 'Plan harvests',
  },
  { 
    icon: AlertTriangle, 
    key: 'weatherAlerts', 
    path: '/alerts',
    gradient: 'from-destructive to-destructive/70',
    bgGlow: 'bg-destructive/15',
    description: 'Storm warnings',
    alertCount: 2,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 20,
    },
  },
};

export const QuickAccessGrid: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
    >
      {quickAccessItems.map((item, index) => {
        const Icon = item.icon;
        const isHighlighted = index < 2;
        
        return (
          <motion.button
            key={item.key}
            variants={itemVariants}
            onClick={() => navigate(item.path)}
            className={`
              relative group overflow-hidden
              clay-card-hover p-4 sm:p-5 
              flex flex-col items-start gap-3
              text-left
              ${isHighlighted ? 'sm:col-span-1' : ''}
            `}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Background glow effect */}
            <motion.div 
              className={`absolute -top-10 -right-10 w-24 h-24 ${item.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            
            {/* Badge */}
            {item.badge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md bg-primary/20 text-primary"
              >
                {item.badge}
              </motion.span>
            )}
            
            {/* Alert badge */}
            {item.alertCount && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                {item.alertCount}
              </motion.span>
            )}

            {/* Icon container with gradient */}
            <div className="relative">
              <motion.div 
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Icon size={24} className="text-white drop-shadow-sm" />
              </motion.div>
              
              {/* Sparkle effect for AI items */}
              {item.badge === 'AI' && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles size={14} className="text-accent" />
                </motion.div>
              )}
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {t(item.key)}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">
                {item.description}
              </p>
            </div>

            {/* Arrow indicator */}
            <motion.div 
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -5 }}
              whileHover={{ x: 0 }}
            >
              <ArrowRight size={14} className="text-primary" />
            </motion.div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};