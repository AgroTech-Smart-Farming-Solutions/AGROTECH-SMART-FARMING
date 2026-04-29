import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Languages, X, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  React.useEffect(() => {
    if (!profile) return;
    
    const fetchUnread = async () => {
      const { data: convs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', profile.user_id);
      if (!convs || convs.length === 0) return;
      const convIds = convs.map(c => c.conversation_id);
      
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', convIds)
        .neq('sender_id', profile.user_id)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (msgs) {
        const fullNotifs = await Promise.all(msgs.map(async (m) => {
          const { data: sender } = await supabase.from('profiles').select('name').eq('user_id', m.sender_id).maybeSingle();
          return {
            id: m.id,
            convId: m.conversation_id,
            title: `Message from ${sender?.name || 'User'}`,
            message: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'message'
          };
        }));
        setNotifications(fullNotifs);
      }
    };

    fetchUnread();

    const channel = supabase.channel('header_notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        if (payload.new.sender_id !== profile.user_id) {
            const { data: isParticipant } = await supabase.from('conversation_participants').select('id').eq('conversation_id', payload.new.conversation_id).eq('user_id', profile.user_id).maybeSingle();
            if (isParticipant) {
              const { data: sender } = await supabase.from('profiles').select('name').eq('user_id', payload.new.sender_id).maybeSingle();
              const newNotif = {
                id: payload.new.id,
                convId: payload.new.conversation_id,
                title: `Message from ${sender?.name || 'User'}`,
                message: payload.new.content,
                time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'message'
              };
              setNotifications(prev => [newNotif, ...prev]);
              toast.info(`New message from ${sender?.name || 'User'}`);
            }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

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
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="clay-dock mx-auto max-w-4xl lg:ml-24 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.button onClick={() => setShowLanguages(!showLanguages)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative clay-card px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2">
              <Languages size={14} className="text-primary" />
              <span className="text-xs font-semibold hidden xs:inline">{currentLang?.native}</span>
            </motion.button>
            <motion.button onClick={() => setShowNotifications(!showNotifications)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative clay-card w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
              <Bell size={16} className="sm:w-[18px] sm:h-[18px]" />
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-destructive to-destructive/80 rounded-full text-[9px] sm:text-[10px] text-destructive-foreground flex items-center justify-center font-bold shadow-sm">
                {notifications.length}
              </motion.span>
            </motion.button>
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

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 lg:right-24 z-50 clay-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">{t('notifications')}</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('noNotifications') || 'No new notifications'}</p>
                ) : (
                  notifications.map((notif, index) => (
                    <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      onClick={() => { setShowNotifications(false); if (notif.convId) navigate(`/messages?chat=${notif.convId}`); }}
                      className="clay-inset p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-3 py-2 text-xs font-semibold text-primary text-center rounded-xl hover:bg-primary/5 transition-colors">
                {t('viewAllNotifications')}
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
