import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const updateCount = () => {
    const alerts = JSON.parse(localStorage.getItem('agrotech_notifications') || '[]');
    const unread = alerts.filter((a: any) => a.read === false).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('agrotech_new_alert', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('agrotech_new_alert', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <button 
      onClick={() => navigate('/notifications')} 
      className="relative p-2 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
      title="Alerts & Notifications"
    >
      <Bell size={24} className="text-foreground" />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};