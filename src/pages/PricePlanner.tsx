import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, IndianRupee } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const priceData = [
  { date: 'Jan 1', wheat: 2150, tomato: 35, onion: 28 },
  { date: 'Jan 8', wheat: 2180, tomato: 42, onion: 32 },
  { date: 'Jan 15', wheat: 2200, tomato: 38, onion: 35 },
  { date: 'Jan 22', wheat: 2220, tomato: 45, onion: 30 },
  { date: 'Jan 29', wheat: 2250, tomato: 52, onion: 28 },
  { date: 'Feb 5', wheat: 2280, tomato: 48, onion: 25 },
];

const commodities = [
  { name: 'Wheat', price: '₹2,280/Qtl', change: +5.2, trend: 'up', icon: '🌾' },
  { name: 'Tomato', price: '₹48/Kg', change: -7.6, trend: 'down', icon: '🍅' },
  { name: 'Onion', price: '₹25/Kg', change: -10.7, trend: 'down', icon: '🧅' },
  { name: 'Rice', price: '₹2,850/Qtl', change: +2.1, trend: 'up', icon: '🍚' },
  { name: 'Potato', price: '₹18/Kg', change: +3.5, trend: 'up', icon: '🥔' },
];

const predictions = {
  en: {
    title: 'Best Time to Sell Wheat',
    prediction: 'Prices expected to peak around Feb 20-25',
    reason: 'Government procurement season starts. Historical data shows 8-12% price increase during this period.',
    confidence: 85,
  },
  hi: {
    title: 'गेहूं बेचने का सबसे अच्छा समय',
    prediction: 'कीमतें 20-25 फरवरी के आसपास चरम पर होने की उम्मीद',
    reason: 'सरकारी खरीद का मौसम शुरू। ऐतिहासिक डेटा इस अवधि में 8-12% मूल्य वृद्धि दर्शाता है।',
    confidence: 85,
  },
  mr: {
    title: 'गहू विकण्याची सर्वोत्तम वेळ',
    prediction: 'किंमती 20-25 फेब्रुवारी च्या आसपास शिखरावर जाण्याची अपेक्षा',
    reason: 'सरकारी खरेदी हंगाम सुरू. ऐतिहासिक डेटा या कालावधीत 8-12% किंमत वाढ दर्शवतो.',
    confidence: 85,
  },
  pa: {
    title: 'ਕਣਕ ਵੇਚਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ',
    prediction: 'ਕੀਮਤਾਂ 20-25 ਫਰਵਰੀ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਸਿਖਰ ਤੇ ਹੋਣ ਦੀ ਉਮੀਦ',
    reason: 'ਸਰਕਾਰੀ ਖਰੀਦ ਸੀਜ਼ਨ ਸ਼ੁਰੂ। ਇਤਿਹਾਸਕ ਡੇਟਾ ਇਸ ਮਿਆਦ ਵਿੱਚ 8-12% ਕੀਮਤ ਵਾਧਾ ਦਰਸਾਉਂਦਾ ਹੈ।',
    confidence: 85,
  },
};

const PricePlanner: React.FC = () => {
  const { t, language } = useLanguage();
  const prediction = predictions[language] || predictions.en;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <TrendingUp className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('mandiPrices')}</h1>
            <p className="text-xs text-muted-foreground">Real-time market prices</p>
          </div>
        </div>

        {/* Price Chart */}
        <ClayCard>
          <h3 className="font-bold mb-4">Price Trends (Last 5 Weeks)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="wheat" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorWheat)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Prediction Card */}
        <ClayCard className="bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Calendar size={20} className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold">{t('bestTimeToSell')}</h3>
              <p className="text-xs text-muted-foreground">{t('prediction')}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-2xl font-bold text-primary">{prediction.confidence}%</span>
              <p className="text-[10px] text-muted-foreground">Confidence</p>
            </div>
          </div>
          <p className="font-semibold text-lg mb-2">{prediction.prediction}</p>
          <p className="text-sm text-muted-foreground">{prediction.reason}</p>
        </ClayCard>

        {/* Commodity Prices */}
        <div>
          <h3 className="font-bold mb-3">Today's Mandi Prices</h3>
          <div className="space-y-3">
            {commodities.map((commodity, index) => (
              <motion.div
                key={commodity.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ClayCard className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{commodity.icon}</span>
                    <div>
                      <p className="font-semibold">{commodity.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <IndianRupee size={12} />
                        {commodity.price}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    commodity.trend === 'up' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {commodity.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {commodity.change > 0 ? '+' : ''}{commodity.change}%
                  </div>
                </ClayCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default PricePlanner;
