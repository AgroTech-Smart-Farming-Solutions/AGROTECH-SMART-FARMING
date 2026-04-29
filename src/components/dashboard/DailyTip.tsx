import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';

const tips = {
  en: [
    { tip: "Water your tomato plants in the morning to prevent fungal diseases.", category: "Irrigation" },
    { tip: "Apply neem oil spray to protect against common pests naturally.", category: "Pest Control" },
    { tip: "Mulching helps retain soil moisture and reduces weed growth.", category: "Soil Care" },
    { tip: "Rotate crops each season to maintain soil health.", category: "Planning" },
    { tip: "Harvest vegetables in the early morning for best flavor and shelf life.", category: "Harvest" },
  ],
  hi: [
    { tip: "फफूंद रोगों से बचाव के लिए टमाटर के पौधों को सुबह पानी दें।", category: "सिंचाई" },
    { tip: "प्राकृतिक तरीके से कीटों से बचाव के लिए नीम के तेल का स्प्रे करें।", category: "कीट नियंत्रण" },
    { tip: "मल्चिंग से मिट्टी की नमी बनी रहती है और खरपतवार कम होते हैं।", category: "मिट्टी देखभाल" },
    { tip: "मिट्टी की सेहत बनाए रखने के लिए हर मौसम फसल बदलें।", category: "योजना" },
    { tip: "सबसे अच्छे स्वाद के लिए सुबह जल्दी सब्जियां तोड़ें।", category: "फसल" },
  ],
  mr: [
    { tip: "बुरशीजन्य रोग टाळण्यासाठी टोमॅटोच्या रोपांना सकाळी पाणी द्या.", category: "सिंचन" },
    { tip: "कीटकांपासून नैसर्गिक संरक्षणासाठी कडुलिंबाच्या तेलाची फवारणी करा.", category: "कीड नियंत्रण" },
    { tip: "मल्चिंगमुळे जमिनीतील ओलावा टिकतो आणि तण कमी होतात.", category: "माती काळजी" },
    { tip: "जमिनीचे आरोग्य राखण्यासाठी प्रत्येक हंगामात पिके फिरवा.", category: "नियोजन" },
    { tip: "उत्तम चवीसाठी भाज्या सकाळी लवकर काढा.", category: "कापणी" },
  ],
  pa: [
    { tip: "ਫੰਗਲ ਬਿਮਾਰੀਆਂ ਤੋਂ ਬਚਣ ਲਈ ਟਮਾਟਰ ਦੇ ਪੌਦਿਆਂ ਨੂੰ ਸਵੇਰੇ ਪਾਣੀ ਦਿਓ।", category: "ਸਿੰਚਾਈ" },
    { tip: "ਕੀੜਿਆਂ ਤੋਂ ਕੁਦਰਤੀ ਸੁਰੱਖਿਆ ਲਈ ਨਿੰਮ ਦੇ ਤੇਲ ਦਾ ਸਪਰੇਅ ਕਰੋ।", category: "ਕੀੜੇ ਕੰਟਰੋਲ" },
    { tip: "ਮਲਚਿੰਗ ਨਾਲ ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਣੀ ਰਹਿੰਦੀ ਹੈ।", category: "ਮਿੱਟੀ ਦੇਖਭਾਲ" },
    { tip: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਲਈ ਹਰ ਮੌਸਮ ਫਸਲ ਬਦਲੋ।", category: "ਯੋਜਨਾ" },
    { tip: "ਵਧੀਆ ਸੁਆਦ ਲਈ ਸਬਜ਼ੀਆਂ ਸਵੇਰੇ ਤੋੜੋ।", category: "ਵਾਢੀ" },
  ],
};

export const DailyTip: React.FC = () => {
  const { t, language } = useLanguage();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentTips = tips[language] || tips.en;

  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    setCurrentTipIndex(dayOfWeek % currentTips.length);
  }, [currentTips.length]);

  // Auto-rotate tips
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % currentTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentTips.length]);

  const nextTip = () => {
    setIsAutoPlaying(false);
    setCurrentTipIndex((prev) => (prev + 1) % currentTips.length);
  };

  const prevTip = () => {
    setIsAutoPlaying(false);
    setCurrentTipIndex((prev) => (prev - 1 + currentTips.length) % currentTips.length);
  };

  const currentTip = currentTips[currentTipIndex];

  return (
    <ClayCard className="relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{ 
          background: [
            'radial-gradient(circle at 0% 0%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, hsl(var(--accent)) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, hsl(var(--accent)) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating sparkles */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{ 
          y: [0, -5, 0],
          rotate: [0, 10, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles size={16} className="text-accent" />
      </motion.div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg"
            >
              <Lightbulb size={22} className="text-accent-foreground" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm text-foreground">{t('dailyTip')}</h3>
              <p className="text-[10px] text-muted-foreground">Smart farming insights</p>
            </div>
          </div>

          {/* Category badge */}
          <motion.span 
            key={currentTip.category}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-primary/10 text-primary"
          >
            {currentTip.category}
          </motion.span>
        </div>

        {/* Tip content */}
        <div className="min-h-[60px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTipIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-base text-foreground/90 leading-relaxed"
            >
              {currentTip.tip}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between mt-5">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {currentTips.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentTipIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentTipIndex 
                    ? 'w-6 bg-primary' 
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={prevTip}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl clay-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              onClick={nextTip}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-xl clay-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Learn more link */}
        <motion.button
          whileHover={{ x: 5 }}
          className="mt-4 flex items-center gap-2 text-xs text-primary font-semibold group"
        >
          <BookOpen size={12} />
          <span>Learn more about {currentTip.category.toLowerCase()}</span>
          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>
    </ClayCard>
  );
};
