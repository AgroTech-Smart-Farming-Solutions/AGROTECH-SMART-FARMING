import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoImg from '@/assets/logo.png';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import AIChat from '@/pages/AIChat';
import CropDoctor from '@/pages/CropDoctor';
import PricePlanner from '@/pages/PricePlanner';
import AgriShorts from '@/pages/AgriShorts';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import NotFound from '@/pages/NotFound';

// --- NAYE PAGES IMPORTS ---
import CropCalendar from '@/pages/CropCalendar';
import WeatherAlerts from '@/pages/WeatherAlerts';
import KisanKhata from '@/pages/KisanKhata';
import GovtSchemes from '@/pages/GovtSchemes';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">{children}</motion.div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mb-6"
        style={{ boxShadow: '0 12px 40px hsl(var(--primary) / 0.3)' }}
      >
        <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-extrabold gradient-text"
      >
        AgroTech
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-muted-foreground mt-2"
      >
        Smart Farming for Everyone
      </motion.p>
      <motion.div
        className="mt-8 w-48 h-1.5 rounded-full bg-muted overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.9, duration: 1.2, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
};

export const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      </AnimatePresence>

      {!showPreloader && (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><PageWrapper><AIChat /></PageWrapper></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><PageWrapper><CropDoctor /></PageWrapper></ProtectedRoute>} />
            
            {/* --- NAYE TOOLS ROUTES --- */}
            <Route path="/calendar" element={<ProtectedRoute><PageWrapper><CropCalendar /></PageWrapper></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><PageWrapper><WeatherAlerts /></PageWrapper></ProtectedRoute>} />
            <Route path="/ledger" element={<ProtectedRoute><PageWrapper><KisanKhata /></PageWrapper></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><PageWrapper><GovtSchemes /></PageWrapper></ProtectedRoute>} />
            
            <Route path="/prices" element={<ProtectedRoute><PageWrapper><PricePlanner /></PageWrapper></ProtectedRoute>} />
           {/* --- AGRI SHORTS ROUTES --- */}
            <Route path="/reels" element={<ProtectedRoute><PageWrapper><AgriShorts /></PageWrapper></ProtectedRoute>} />
            <Route path="/reels/:id" element={<ProtectedRoute><PageWrapper><AgriShorts /></PageWrapper></ProtectedRoute>} />
            {/* -------------------------- */}
            <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><PageWrapper><Subscription /></PageWrapper></ProtectedRoute>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
};