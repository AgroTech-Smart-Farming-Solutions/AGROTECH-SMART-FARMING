import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MessageCircle, ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const reelsData = [
  {
    id: '1',
    title: 'Drip Irrigation Setup Guide',
    description: 'Learn how to set up drip irrigation in 5 easy steps. Save 40% water!',
    author: 'Kisan Channel',
    likes: 12500,
    comments: 342,
    shares: 89,
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Organic Pest Control with Neem',
    description: 'Make your own neem oil spray at home. 100% organic and effective!',
    author: 'Organic Farmer',
    likes: 8900,
    comments: 156,
    shares: 234,
    thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    category: 'Organic',
  },
  {
    id: '3',
    title: 'PM-KISAN: How to Apply',
    description: 'Step by step guide to apply for PM-KISAN scheme and get ₹6000/year',
    author: 'Govt Schemes',
    likes: 45000,
    comments: 1200,
    shares: 5600,
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
    category: 'Schemes',
  },
  {
    id: '4',
    title: 'Wheat Harvesting Tips',
    description: 'Best practices for wheat harvesting to maximize yield',
    author: 'Agriculture Expert',
    likes: 6700,
    comments: 89,
    shares: 145,
    thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
    category: 'Tips',
  },
  {
    id: '5',
    title: 'Tomato Disease Prevention',
    description: 'How to identify and prevent common tomato diseases',
    author: 'Crop Doctor',
    likes: 9200,
    comments: 267,
    shares: 178,
    thumbnail: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400',
    category: 'Health',
  },
];

const AgriShorts: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reelsData[currentIndex];

  const goToNext = () => {
    if (currentIndex < reelsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleLike = (id: string) => {
    const newLiked = new Set(liked);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLiked(newLiked);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Handle swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') goToPrev();
      if (e.key === 'ArrowDown') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] relative overflow-hidden">
        {/* Main Reel View */}
        <div 
          ref={containerRef}
          className="h-full w-full rounded-3xl overflow-hidden relative clay-card"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReel.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="h-full w-full relative"
            >
              {/* Thumbnail/Video */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentReel.thumbnail})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
              </div>

              {/* Play/Pause overlay */}
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="w-20 h-20 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Play size={40} className="text-foreground ml-2" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="px-2 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs font-medium">
                    {currentReel.category}
                  </span>
                  <h2 className="text-lg font-bold mt-2 text-foreground drop-shadow-lg">
                    {currentReel.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {currentReel.description}
                  </p>
                  <p className="text-xs text-primary font-medium mt-2">
                    @{currentReel.author}
                  </p>
                </motion.div>
              </div>

              {/* Side Actions */}
              <div className="absolute right-3 bottom-32 flex flex-col gap-4">
                <motion.button
                  onClick={() => toggleLike(currentReel.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    liked.has(currentReel.id) ? 'bg-destructive' : 'bg-background/50 backdrop-blur-sm'
                  }`}>
                    <Heart 
                      size={24} 
                      className={liked.has(currentReel.id) ? 'text-destructive-foreground fill-current' : 'text-foreground'} 
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {formatNumber(currentReel.likes + (liked.has(currentReel.id) ? 1 : 0))}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={24} className="text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{formatNumber(currentReel.comments)}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <Share2 size={24} className="text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{formatNumber(currentReel.shares)}</span>
                </motion.button>

                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    {isMuted ? <VolumeX size={24} className="text-foreground" /> : <Volume2 size={24} className="text-foreground" />}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <motion.button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
            >
              <ChevronUp size={24} className="text-foreground" />
            </motion.button>
            <motion.button
              onClick={goToNext}
              disabled={currentIndex === reelsData.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
            >
              <ChevronDown size={24} className="text-foreground" />
            </motion.button>
          </div>

          {/* Progress Indicator */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {reelsData.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1 h-4 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary h-8' : 'bg-background/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AgriShorts;
