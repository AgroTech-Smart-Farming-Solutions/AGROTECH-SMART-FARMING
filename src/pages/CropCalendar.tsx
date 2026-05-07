import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// 🚀 ADVANCED MOCK DATA
const smartCropData = {
  wheat: {
    crop: 'Wheat',
    icon: '🌾',
    stages: [
      { name: 'Sowing (Bijai)', daysAfterSowing: 0, icon: '🌱', desc: 'Sow seeds at 3-5 cm depth.' },
      { name: 'Crown Root Irrigation', daysAfterSowing: 21, icon: '💧', desc: 'First crucial watering.', weatherAlert: '⛈️ 80% Rain prediction tomorrow. Delay irrigation!' },
      { name: 'Tillering (Fertilizer)', daysAfterSowing: 45, icon: '🪴', desc: 'Apply first dose of Urea.' },
      { name: 'Heading Stage', daysAfterSowing: 85, icon: '🌾', desc: 'Watch out for yellow rust disease.' },
      { name: 'Harvesting (Katai)', daysAfterSowing: 130, icon: '🚜', desc: 'Harvest when moisture is below 14%.' },
    ],
  },
  tomato: {
    crop: 'Tomato',
    icon: '🍅',
    stages: [
      { name: 'Nursery Prep', daysAfterSowing: 0, icon: '🌱', desc: 'Prepare raised beds.' },
      { name: 'Transplanting', daysAfterSowing: 25, icon: '🪴', desc: 'Move to main field.' },
      { name: 'Flowering & Staking', daysAfterSowing: 55, icon: '🌸', desc: 'Provide bamboo support.', weatherAlert: '🔥 Heatwave alert! Keep soil moist.' },
      { name: 'First Picking', daysAfterSowing: 85, icon: '🧺', desc: 'Harvest mature green/red tomatoes.' },
    ],
  },
};

const CropCalendar: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'tomato' | 'custom'>('wheat');
  const [customCropName, setCustomCropName] = useState('');
  const [sowingDate, setSowingDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const calculateDate = (daysToAdd: number) => {
    if (!sowingDate) return 'Pending...';
    const date = new Date(sowingDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActiveStages = () => {
    if (selectedCrop === 'custom') {
      const name = customCropName || 'Fasal';
      return [
        { name: `Sowing ${name}`, daysAfterSowing: 0, icon: '🌱', desc: `Prepare soil and sow ${name} seeds.` },
        { name: 'Vegetative Growth & Care', daysAfterSowing: 25, icon: '🌿', desc: 'First irrigation and remove weeds.', weatherAlert: '🌤️ Clear weather for spraying.' },
        { name: 'Flowering / Mid-Stage', daysAfterSowing: 60, icon: '🌸', desc: 'Apply recommended fertilizers and check for pests.' },
        { name: `Harvesting ${name}`, daysAfterSowing: 110, icon: '🚜', desc: `Check maturity and harvest ${name}.` },
      ];
    }
    return smartCropData[selectedCrop].stages;
  };

  const handleGenerate = () => {
    if (!sowingDate) {
      alert("Pehle bone ki tarikh (sowing date) select karein!");
      return;
    }
    if (selectedCrop === 'custom' && !customCropName) {
      alert("Please apni fasal ka naam likhein!");
      return;
    }
    
    setIsGenerating(true);
    setShowTimeline(false);
    
    setTimeout(() => {
      setIsGenerating(false);
      setShowTimeline(true);
    }, 1500);
  };

  const handleKhataRedirect = () => {
    navigate('/ledger');
  };

  const activeStages = getActiveStages();

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
        <div>
          <h1 className="text-xl font-bold">{t('cropCalendar') || 'Smart Crop Calendar'}</h1>
          <p className="text-xs text-muted-foreground mt-1">AI-powered weather & timeline tracking</p>
        </div>

        {/* 1. CROP SELECTION - Restored to Clay Theme */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          <motion.button
            onClick={() => { setSelectedCrop('wheat'); setShowTimeline(false); }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${selectedCrop === 'wheat' ? 'clay-inset text-primary' : 'clay-card text-muted-foreground'}`}
          >
            <span>🌾</span><span>Wheat</span>
          </motion.button>
          
          <motion.button
            onClick={() => { setSelectedCrop('tomato'); setShowTimeline(false); }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${selectedCrop === 'tomato' ? 'clay-inset text-primary' : 'clay-card text-muted-foreground'}`}
          >
            <span>🍅</span><span>Tomato</span>
          </motion.button>

          <motion.button
            onClick={() => { setSelectedCrop('custom'); setShowTimeline(false); }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${selectedCrop === 'custom' ? 'clay-inset text-primary' : 'clay-card text-muted-foreground'}`}
          >
            <span>✨</span><span>Any Crop (AI)</span>
          </motion.button>
        </div>

        {/* 2. INPUT FORM - Restored to Clay Theme */}
        <ClayCard className="space-y-4">
            
          <AnimatePresence>
            {selectedCrop === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-sm font-semibold text-foreground mb-2">Crop Name (Fasal ka naam) 🔍</label>
                <input 
                  type="text" 
                  placeholder="e.g. Potato, Sugarcane..."
                  className="w-full p-3 rounded-xl clay-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm mb-2 text-foreground bg-transparent"
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Sowing Date (Bone ki Tarikh) 📅</label>
            <input 
              type="date" 
              className="w-full p-3 rounded-xl clay-inset focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-foreground bg-transparent"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleGenerate}
            className="w-full clay-card text-primary font-bold py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 hover:opacity-80"
          >
            {isGenerating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : '✨ Generate AI Timeline'}
          </button>
        </ClayCard>

        {/* 3. TIMELINE DISPLAY - Restored to Clay Theme */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <ClayCard>
                <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-3">
                  <h3 className="font-bold text-lg text-foreground">Your Custom Timeline</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg clay-inset text-primary">Live Synced 🟢</span>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-primary/20">
                  
                  {activeStages.map((stage, index) => (
                    <motion.div key={stage.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      {/* Icon */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl clay-inset text-2xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 bg-background">
                        {stage.icon}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl clay-card">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold px-2 py-1 rounded-md w-fit clay-inset text-primary">
                            {calculateDate(stage.daysAfterSowing)}
                          </span>
                          <h4 className="font-bold text-foreground mt-1">{stage.name}</h4>
                          <p className="text-xs text-muted-foreground leading-tight">{stage.desc}</p>
                          
                          {/* 🚨 Weather Alert Badge */}
                          {stage.weatherAlert && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 p-2 rounded-lg flex items-start gap-2 clay-inset bg-red-50/50">
                              <span className="text-xs font-semibold text-red-600">{stage.weatherAlert}</span>
                            </motion.div>
                          )}

                          {/* 📒 WORKING: Add to Khata Button */}
                          {index > 0 && index < 4 && (
                            <button 
                              onClick={handleKhataRedirect}
                              className="mt-3 text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-lg clay-card text-primary transition-all active:scale-95 w-fit hover:opacity-80"
                            >
                              + Add Expense to Khata
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default CropCalendar;