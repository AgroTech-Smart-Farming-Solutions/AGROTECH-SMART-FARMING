import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Calendar, AlertTriangle, BookOpen, FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock Data
const cropCalendarData = {
  wheat: {
    crop: 'Wheat',
    stages: [
      { name: 'Sowing', date: 'Nov 1-15', icon: '🌱' },
      { name: 'Germination', date: 'Nov 15-25', icon: '🌿' },
      { name: 'Tillering', date: 'Dec 1-30', icon: '🪴' },
      { name: 'Heading', date: 'Feb 1-28', icon: '🌾' },
      { name: 'Harvest', date: 'Apr 1-15', icon: '🌾' },
    ],
  },
  tomato: {
    crop: 'Tomato',
    stages: [
      { name: 'Nursery', date: 'Sep 1-15', icon: '🌱' },
      { name: 'Transplant', date: 'Oct 1-15', icon: '🪴' },
      { name: 'Flowering', date: 'Nov 1-15', icon: '🌸' },
      { name: 'Fruiting', date: 'Dec 1-31', icon: '🍅' },
      { name: 'Harvest', date: 'Jan-Mar', icon: '🧺' },
    ],
  },
};

const govtSchemes = [
  { 
    name: 'PM-KISAN', 
    description: '₹6,000/year direct benefit transfer', 
    eligibility: 'All landholding farmers',
    deadline: 'Ongoing',
  },
  { 
    name: 'Pradhan Mantri Fasal Bima Yojana', 
    description: 'Crop insurance at 2% premium', 
    eligibility: 'Farmers growing notified crops',
    deadline: 'Before sowing',
  },
  { 
    name: 'Kisan Credit Card', 
    description: 'Credit at 4% interest rate', 
    eligibility: 'All farmers, share croppers, tenant farmers',
    deadline: 'Ongoing',
  },
  { 
    name: 'Soil Health Card Scheme', 
    description: 'Free soil testing and fertilizer recommendations', 
    eligibility: 'All farmers',
    deadline: 'Ongoing',
  },
];

interface LedgerEntry {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
}

interface WeatherAlert {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  date: string;
}

const SmartTools: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'calendar';

  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'tomato'>('wheat');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [newEntry, setNewEntry] = useState<{ name: string; category: string; amount: string; type: 'expense' | 'income' }>({ name: '', category: 'Seeds', amount: '', type: 'expense' });
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  const tabs = [
    { id: 'calendar', label: t('cropCalendar'), icon: Calendar },
    { id: 'alerts', label: t('weatherAlerts'), icon: AlertTriangle },
    { id: 'ledger', label: t('ledger'), icon: BookOpen },
    { id: 'schemes', label: t('schemes'), icon: FileText },
  ];

  // Fetch Weather
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      
      const getWeather = async (lat: number, lon: number) => {
        try {
          const API_KEY = '34bcd684fb54306142476353e9f3d6b0';
          const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
          const data = await response.json();
          
          if (!data.list) throw new Error("Invalid format");
          
          const alerts: WeatherAlert[] = [];
          let heavyRain = false, heatWave = false, frost = false;
          
          data.list.slice(0, 24).forEach((item: any) => {
             const temp = item.main.temp_max;
             const rain = item.rain ? item.rain['3h'] || 0 : 0;
             const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
             
             if (rain > 10 && !heavyRain) {
               heavyRain = true;
               alerts.push({ type: 'rain', message: `Heavy rain expected. Hold irrigation.`, severity: 'warning', date: dateStr });
             } 
             if (temp > 40 && !heatWave) {
               heatWave = true;
               alerts.push({ type: 'heat', message: `Heat wave alert (${temp}°C). Increase watering.`, severity: 'danger', date: dateStr });
             } 
             if (temp < 5 && !frost) {
               frost = true;
               alerts.push({ type: 'frost', message: `Frost possible (${temp}°C). Cover tender plants.`, severity: 'info', date: dateStr });
             }
          });
          
          if (alerts.length === 0) {
            alerts.push({ type: 'clear', message: `Current temp is ${data.list[0].main.temp}°C in ${data.city.name}. Favorable conditions expected.`, severity: 'info', date: 'Next 3 days' });
          }
          
          setWeatherAlerts(alerts);
        } catch (err) {
          console.error('Error fetching weather:', err);
          setWeatherAlerts([{ type: 'error', message: 'Could not load weather data.', severity: 'warning', date: 'Today' }]);
        } finally {
          setIsLoadingWeather(false);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => getWeather(position.coords.latitude, position.coords.longitude),
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Location permission denied. Using default location.");
            getWeather(21.1458, 79.0882); // Default to Nagpur
          }
        );
      } else {
        toast.error("Geolocation not supported. Using default location.");
        getWeather(21.1458, 79.0882);
      }
    };
    
    if (activeTab === 'alerts') {
      fetchWeather();
    }
  }, [activeTab]);

  // Fetch Ledger
  useEffect(() => {
    const fetchLedger = async () => {
      if (!user) {
        setIsLoadingLedger(false);
        return;
      }
      try {
        setIsLoadingLedger(true);
        const { data, error } = await supabase
          .from('ledger_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        setLedgerEntries(data || []);
      } catch (err) {
        console.error('Error fetching ledger:', err);
        toast.error('Failed to load ledger entries');
      } finally {
        setIsLoadingLedger(false);
      }
    };
    
    if (activeTab === 'ledger') {
      fetchLedger();
    }
  }, [user, activeTab]);

  const addLedgerEntry = async () => {
    if (!user) {
      toast.error('Please login to add entries');
      return;
    }
    
    if (newEntry.name && newEntry.amount) {
      const entryData = {
        user_id: user.id,
        name: newEntry.name,
        category: newEntry.category,
        amount: parseFloat(newEntry.amount),
        type: newEntry.type,
        date: new Date().toISOString().split('T')[0],
      };
      
      try {
        const { data, error } = await supabase
          .from('ledger_entries')
          .insert([entryData])
          .select()
          .single();
          
        if (error) throw error;
        
        setLedgerEntries([data, ...ledgerEntries]);
        setNewEntry({ name: '', category: 'Seeds', amount: '', type: 'expense' });
        toast.success('Entry added successfully');
      } catch (err) {
        console.error('Error adding entry:', err);
        toast.error('Failed to add ledger entry');
      }
    }
  };

  const deleteLedgerEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ledger_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setLedgerEntries(ledgerEntries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry');
    }
  };

  const totalIncome = ledgerEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = ledgerEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">{t('tools')}</h1>
          <p className="text-xs text-muted-foreground">Essential farming tools</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? 'clay-inset text-primary' : 'clay-card text-muted-foreground'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Crop Calendar */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Crop Selector */}
              <div className="flex gap-2">
                {(['wheat', 'tomato'] as const).map((crop) => (
                  <motion.button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium capitalize ${
                      selectedCrop === crop ? 'clay-inset text-primary' : 'clay-card'
                    }`}
                  >
                    {crop === 'wheat' ? '🌾' : '🍅'} {crop}
                  </motion.button>
                ))}
              </div>

              {/* Timeline */}
              <ClayCard>
                <h3 className="font-bold mb-4">{cropCalendarData[selectedCrop].crop} Calendar</h3>
                <div className="space-y-4">
                  {cropCalendarData[selectedCrop].stages.map((stage, index) => (
                    <motion.div
                      key={stage.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center text-2xl">
                        {stage.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{stage.name}</h4>
                        <p className="text-sm text-muted-foreground">{stage.date}</p>
                      </div>
                      {index < cropCalendarData[selectedCrop].stages.length - 1 && (
                        <div className="absolute left-10 top-14 w-0.5 h-8 bg-border" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ClayCard>
            </motion.div>
          )}

          {/* Weather Alerts */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-4"
             >
              {isLoadingWeather ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                weatherAlerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ClayCard className={`border-l-4 ${
                      alert.severity === 'danger' ? 'border-l-destructive' :
                      alert.severity === 'warning' ? 'border-l-accent' : 'border-l-primary'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={
                          alert.severity === 'danger' ? 'text-destructive' :
                          alert.severity === 'warning' ? 'text-accent-foreground' : 'text-primary'
                        } size={20} />
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                        </div>
                      </div>
                    </ClayCard>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Ledger */}
          {activeTab === 'ledger' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <div className="grid grid-cols-3 gap-3">
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('income')}</p>
                  <p className="text-lg font-bold text-primary">₹{totalIncome.toLocaleString()}</p>
                </ClayCard>
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('expense')}</p>
                  <p className="text-lg font-bold text-destructive">₹{totalExpense.toLocaleString()}</p>
                </ClayCard>
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('netProfit')}</p>
                  <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    ₹{netProfit.toLocaleString()}
                  </p>
                </ClayCard>
              </div>

              {/* Add Entry Form */}
              <ClayCard>
                <h3 className="font-bold mb-4">{t('addExpense')}</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    className="clay-inset border-0"
                  />
                  <div className="flex gap-2">
                    <Select 
                      value={newEntry.category} 
                      onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                    >
                      <SelectTrigger className="clay-inset border-0 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Seeds">{t('seeds')}</SelectItem>
                        <SelectItem value="Fertilizer">{t('fertilizer')}</SelectItem>
                        <SelectItem value="Labor">{t('labor')}</SelectItem>
                        <SelectItem value="Sale">Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={newEntry.type} 
                      onValueChange={(v) => setNewEntry({ ...newEntry, type: v as 'expense' | 'income' })}
                    >
                      <SelectTrigger className="clay-inset border-0 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">{t('expense')}</SelectItem>
                        <SelectItem value="income">{t('income')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount (₹)"
                      value={newEntry.amount}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                      className="clay-inset border-0 flex-1"
                    />
                    <ClayButton onClick={addLedgerEntry} variant="primary">
                      <Plus size={18} />
                    </ClayButton>
                  </div>
                </div>
              </ClayCard>

              {/* Entries List */}
              <ClayCard>
                <h3 className="font-bold mb-4">Recent Entries</h3>
                <div className="space-y-3">
                  {isLoadingLedger ? (
                    <div className="flex justify-center py-4">
                       <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : ledgerEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noData')}</p>
                  ) : (
                    ledgerEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-3 clay-inset rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-sm">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.category} • {entry.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${entry.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                            {entry.type === 'income' ? '+' : '-'}₹{entry.amount}
                          </span>
                          <button onClick={() => deleteLedgerEntry(entry.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ClayCard>
            </motion.div>
          )}

          {/* Govt Schemes */}
          {activeTab === 'schemes' && (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {govtSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ClayCard variant="hover">
                    <h3 className="font-bold text-primary mb-2">{scheme.name}</h3>
                    <p className="text-sm mb-3">{scheme.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">{scheme.eligibility}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/50">{scheme.deadline}</span>
                    </div>
                    <ClayButton variant="primary" size="sm">
                      {t('applyNow')}
                    </ClayButton>
                  </ClayCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default SmartTools;

