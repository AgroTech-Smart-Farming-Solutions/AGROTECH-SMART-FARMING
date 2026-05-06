import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCircle2, TrendingUp, BellOff } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  commodity?: string;
  market?: string;
  title?: string;
  message?: string;
  date: string;
  read: boolean;
  type: string;
}

const Notifications: React.FC = () => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 🚀 CORE UI TRANSLATIONS
  const dict = {
    en: { pageTitle: 'Notifications', youHave: 'You have', alertsCount: 'alerts', emptyCenter: 'Your alert center', clearAll: 'Clear All', noAlerts: 'No New Alerts', noAlertsDesc: 'Go to the Price Planner page and click the bell icon to set mandi price alerts!', deleteTitle: 'Delete Alert' },
    hi: { pageTitle: 'सूचनाएं', youHave: 'आपके पास', alertsCount: 'अलर्ट हैं', emptyCenter: 'आपका अलर्ट केंद्र', clearAll: 'सभी साफ़ करें', noAlerts: 'कोई नया अलर्ट नहीं', noAlertsDesc: 'प्राइस प्लानर पेज पर जाएं और मंडी भाव अलर्ट सेट करने के लिए बेल आइकन पर क्लिक करें!', deleteTitle: 'अलर्ट हटाएं' },
    pa: { pageTitle: 'ਸੂਚਨਾਵਾਂ', youHave: 'ਤੁਹਾਡੇ ਕੋਲ', alertsCount: 'ਅਲਰਟ ਹਨ', emptyCenter: 'ਤੁਹਾਡਾ ਅਲਰਟ ਕੇਂਦਰ', clearAll: 'ਸਾਰੇ ਸਾਫ਼ ਕਰੋ', noAlerts: 'ਕੋਈ ਨਵਾਂ ਅਲਰਟ ਨਹੀਂ', noAlertsDesc: "ਪ੍ਰਾਈਸ ਪਲਾਨਰ ਪੇਜ 'ਤੇ ਜਾਓ ਅਤੇ ਮੰਡੀ ਭਾਅ ਅਲਰਟ ਸੈੱਟ ਕਰਨ ਲਈ ਬੈੱਲ ਆਈਕਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ!", deleteTitle: 'ਅਲਰਟ ਮਿਟਾਓ' },
    gu: { pageTitle: 'સૂચનાઓ', youHave: 'તમારી પાસે', alertsCount: 'એલર્ટ છે', emptyCenter: 'તમારું એલર્ટ કેન્દ્ર', clearAll: 'બધું સાફ કરો', noAlerts: 'કોઈ નવી સૂચના નથી', noAlertsDesc: 'પ્રાઇસ પ્લાનર પેજ પર જાઓ અને મંડી ભાવ એલર્ટ સેટ કરવા માટે બેલ આઇકન પર ક્લિક કરો!', deleteTitle: 'એલર્ટ કાઢી નાખો' }
  };

  // 🚀 CROP DICTIONARY (To translate English crop names from API to local languages)
  const cropTranslations: Record<string, any> = {
    'Wheat': { hi: 'गेहूं', pa: 'ਕਣਕ', gu: 'ઘઉં' },
    'Rice': { hi: 'चावल', pa: 'ਚੌਲ', gu: 'ચોખા' },
    'Apple': { hi: 'सेब', pa: 'ਸੇਬ', gu: 'સફરજન' },
    'Carrot': { hi: 'गाजर', pa: 'ਗਾਜਰ', gu: 'ગાજર' },
    'Onion': { hi: 'प्याज', pa: 'ਪਿਆਜ਼', gu: 'ડુંગળી' },
    'Tomato': { hi: 'टमाटर', pa: 'ਟਮਾਟਰ', gu: 'ટામેટા' },
    'Potato': { hi: 'आलू', pa: 'ਆਲੂ', gu: 'બટાકા' },
    'Aanar': { hi: 'अनार', pa: 'ਅਨਾਰ', gu: 'દાડમ' },
  };

  const currentText = dict[language as keyof typeof dict] || dict.en;

  // 🚀 THE MAGIC PARSER (Extracts & Translates even the OLD hardcoded English alerts)
  const getLocalizedNotif = (notif: Notification) => {
    let rawCrop = notif.commodity || '';
    let rawMarket = notif.market || '';

    // If it's an OLD alert, extract the data from the English strings
    if (!rawCrop && notif.title) {
      rawCrop = notif.title.replace(' Price Alert Set', '').replace(' Price Alert', '').trim();
    }
    if (!rawMarket && notif.message) {
      const match = notif.message.match(/in (.*?) Mandi/);
      rawMarket = match ? match[1] : 'Local';
    }

    // Translate the crop name if we have it in our dictionary
    const tCrop = cropTranslations[rawCrop]?.[language] || rawCrop;

    if (rawCrop && rawMarket) {
      if (language === 'hi') {
        return {
          title: `${tCrop} भाव अलर्ट`,
          message: `आपको ${rawMarket} मंडी में ${tCrop} के भाव में बड़े बदलावों की सूचना दी जाएगी।`
        };
      }
      if (language === 'pa') {
        return {
          title: `${tCrop} ਕੀਮਤ ਅਲਰਟ`,
          message: `ਤੁਹਾਨੂੰ ${rawMarket} ਮੰਡੀ ਵਿੱਚ ${tCrop} ਦੀਆਂ ਕੀਮਤਾਂ ਵਿੱਚ ਵੱਡੇ ਬਦਲਾਅ ਬਾਰੇ ਸੂਚਿਤ ਕੀਤਾ ਜਾਵੇਗਾ।`
        };
      }
      if (language === 'gu') {
        return {
          title: `${tCrop} ભાવ એલર્ટ`,
          message: `તમને ${rawMarket} મંડીમાં ${tCrop} ના ભાવમાં મોટા ફેરફારોની જાણ કરવામાં આવશે.`
        };
      }
      // English Fallback
      return {
        title: `${rawCrop} Price Alert`,
        message: `You will be notified of major price changes for ${rawCrop} in ${rawMarket} Mandi.`
      };
    }
    return { title: notif.title, message: notif.message };
  };

  const localeMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN', gu: 'gu-IN' };
  const currentLocale = localeMap[language] || 'en-IN';

  useEffect(() => {
    const fetchNotifications = () => {
      const storedAlerts = localStorage.getItem('agrotech_notifications');
      if (storedAlerts) setNotifications(JSON.parse(storedAlerts));
    };
    fetchNotifications();
    window.addEventListener('storage', fetchNotifications);
    return () => window.removeEventListener('storage', fetchNotifications);
  }, []);

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('agrotech_notifications', JSON.stringify(updatedNotifications));
    window.dispatchEvent(new Event('agrotech_new_alert')); 
  };

  const clearAll = () => {
    localStorage.removeItem('agrotech_notifications');
    setNotifications([]);
    window.dispatchEvent(new Event('agrotech_new_alert')); 
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLocale, {
      hour: 'numeric', minute: 'numeric', hour12: true, day: 'numeric', month: 'short'
    }).format(date);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <Bell className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{currentText.pageTitle}</h1>
              <p className="text-xs text-muted-foreground">
                {notifications.length > 0 
                  ? `${currentText.youHave} ${notifications.length} ${currentText.alertsCount}` 
                  : currentText.emptyCenter}
              </p>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-destructive flex items-center gap-1 hover:bg-destructive/10 px-3 py-1.5 rounded-full transition-colors">
              <Trash2 size={14} /> {currentText.clearAll}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="mt-6">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <BellOff size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{currentText.noAlerts}</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">{currentText.noAlertsDesc}</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif, index) => {
                  const localizedContent = getLocalizedNotif(notif);
                  return (
                    <motion.div key={notif.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }} transition={{ delay: index * 0.05 }}>
                      <ClayCard className="p-4 flex gap-4 relative overflow-hidden group">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-1">
                          {notif.type === 'price_alert' ? <TrendingUp size={18} className="text-green-600" /> : <CheckCircle2 size={18} className="text-primary" />}
                        </div>
                        <div className="flex-1 pr-8">
                          <h4 className="font-bold text-sm text-foreground mb-1">{localizedContent.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{localizedContent.message}</p>
                          <p className="text-[10px] font-semibold text-primary/60 mt-2 uppercase tracking-wider">{formatTime(notif.date)}</p>
                        </div>
                        <button onClick={() => deleteNotification(notif.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title={currentText.deleteTitle}>
                          <Trash2 size={16} />
                        </button>
                      </ClayCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </AppLayout>
  );
};

export default Notifications;