import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';

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

const CropCalendar: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'tomato'>('wheat');

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">{t('cropCalendar') || 'Crop Calendar'}</h1>
          <p className="text-xs text-muted-foreground">Track your farming stages</p>
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="flex gap-2">
            {(['wheat', 'tomato'] as const).map((crop) => (
              <motion.button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-2xl text-sm font-medium capitalize ${selectedCrop === crop ? 'clay-inset text-primary' : 'clay-card'}`}
              >
                {crop === 'wheat' ? '🌾' : '🍅'} {crop}
              </motion.button>
            ))}
          </div>
          <ClayCard>
            <h3 className="font-bold mb-4">{cropCalendarData[selectedCrop].crop} Calendar</h3>
            <div className="space-y-4">
              {cropCalendarData[selectedCrop].stages.map((stage, index) => (
                <motion.div key={stage.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center text-2xl">{stage.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{stage.name}</h4>
                    <p className="text-sm text-muted-foreground">{stage.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ClayCard>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default CropCalendar;