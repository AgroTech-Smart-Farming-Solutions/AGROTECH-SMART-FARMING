import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Scheme {
  name: string;
  description: string;
  eligibility: string;
  deadline: string;
  link?: string;
}

const GovtSchemes: React.FC = () => {
  const { t, language } = useLanguage();
  const [govtSchemes, setGovtSchemes] = useState<Scheme[]>([]);
  const [isSchemesLoading, setIsSchemesLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchSchemes = async () => {
    setIsSchemesLoading(true);
    try {
      if (!navigator.onLine) throw new Error('Offline');
      const { data, error } = await supabase.from('govt_schemes').select('*').eq('language', language);
      if (error) throw error;
      if (data) {
        setGovtSchemes(data);
        localStorage.setItem(`schemes_${language}`, JSON.stringify(data));
      }
    } catch (err) {
      const cached = localStorage.getItem(`schemes_${language}`);
      if (cached) setGovtSchemes(JSON.parse(cached));
    } finally {
      setIsSchemesLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
    const handleOnline = () => { setIsOffline(false); fetchSchemes(); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [language]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">{t('schemes') || 'Govt Schemes'}</h1>
          <p className="text-xs text-muted-foreground">Latest government schemes for farmers</p>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {isOffline && (
            <div className="bg-yellow-100 text-yellow-800 text-[10px] p-2 rounded-xl flex items-center gap-2">
              <WifiOff size={14} /> {language === 'hi' ? 'आप ऑफलाइन हैं। पुराना डेटा दिख रहा है।' : 'Showing offline data.'}
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              {language === 'hi' ? 'सरकारी योजनाएं' : 'Schemes List'}
            </h2>
            <button onClick={fetchSchemes} className="p-2 hover:bg-muted rounded-full transition-colors">
              <RefreshCw size={16} className={isSchemesLoading ? "animate-spin text-primary" : "text-muted-foreground"}/>
            </button>
          </div>

          {isSchemesLoading && govtSchemes.length === 0 ? (
            <div className="flex flex-col items-center py-10 opacity-50">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-xs">Updating Schemes...</p>
            </div>
          ) : (
            govtSchemes.map((scheme, index) => (
              <motion.div key={scheme.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ClayCard variant="hover">
                  <h3 className="font-bold text-primary mb-1">{scheme.name}</h3>
                  <p className="text-sm mb-3 leading-relaxed">{scheme.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border/50">{scheme.eligibility}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-accent/20 text-accent-foreground">{scheme.deadline}</span>
                  </div>
                  <ClayButton variant="primary" size="sm" className="w-full sm:w-auto" onClick={() => scheme.link && window.open(scheme.link, '_blank')}>
                    {t('applyNow') || 'Apply Now'}
                  </ClayButton>
                </ClayCard>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default GovtSchemes;