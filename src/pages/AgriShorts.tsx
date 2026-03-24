import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MessageCircle, ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Reel {
  id: string;
  title: string;
  description: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  thumbnail: string;
  category: string;
  mediaType: string;
}

const AgriShorts: React.FC = () => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reelsData, setReelsData] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        // Fetch posts and join with profiles to get author details
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (name, username)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedReels = data.map((post: { id: string; caption: string | null; image_url: string | null; media_type?: string | null; likes: number | null; comments_count: number | null; profiles?: { name?: string | null; username?: string | null } }) => ({
            id: post.id,
            title: post.caption ? post.caption.split('\n')[0] : 'Kisan Shorts',
            description: post.caption || '',
            author: post.profiles?.username || post.profiles?.name || 'Unknown',
            likes: post.likes || 0,
            comments: post.comments_count || 0,
            shares: 0,
            thumbnail: post.image_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
            category: 'Community',
            mediaType: post.media_type || 'image',
          }));
          setReelsData(formattedReels);

          // Fetch user's liked posts if logged in
          if (user) {
            const { data: likedData } = await supabase
              .from('post_likes')
              .select('post_id')
              .eq('user_id', user.id);
            
            if (likedData) {
              setLiked(new Set(likedData.map(l => l.post_id)));
            }
          }
        } else {
          // Fallback static data if DB is empty
          setReelsData([{
            id: 'fallback-1',
            title: 'Welcome to AgriShorts',
            description: 'No posts yet. Share your stories here!',
            author: 'System',
            likes: 0,
            comments: 0,
            shares: 0,
            thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
            category: 'Welcome',
            mediaType: 'image'
          }]);
        }
      } catch (err) {
        console.error('Error fetching reels:', err);
        toast.error('Failed to load shorts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

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

  const toggleLike = async (id: string, currentLikes: number) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    const isCurrentlyLiked = liked.has(id);
    const newLiked = new Set(liked);
    
    // Optimistic UI update
    if (isCurrentlyLiked) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLiked(newLiked);

    try {
      if (isCurrentlyLiked) {
        // Remove like
        await supabase.from('post_likes').delete().eq('post_id', id).eq('user_id', user.id);
        await supabase.from('posts').update({ likes: Math.max(0, currentLikes - 1) }).eq('id', id);
        
        // Update local state smoothly
        setReelsData(prev => prev.map(reel => 
          reel.id === id ? { ...reel, likes: Math.max(0, reel.likes - 1) } : reel
        ));
      } else {
        // Add like
        await supabase.from('post_likes').insert([{ post_id: id, user_id: user.id }]);
        await supabase.from('posts').update({ likes: currentLikes + 1 }).eq('id', id);
        
        // Update local state smoothly
        setReelsData(prev => prev.map(reel => 
          reel.id === id ? { ...reel, likes: reel.likes + 1 } : reel
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      if (isCurrentlyLiked) {
        newLiked.add(id);
      } else {
        newLiked.delete(id);
      }
      setLiked(newLiked);
      toast.error('Failed to update like');
    }
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
  }, [currentIndex, reelsData.length]); // Updated dependencies

  return (
    <AppLayout>
      <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] relative overflow-hidden">
        {/* Main Reel View */}
        <div 
          ref={containerRef}
          className="h-full w-full rounded-3xl overflow-hidden relative clay-card"
        >
          {isLoading ? (
            <div className="flex flex-col h-full items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-2" size={32} />
              <p className="text-muted-foreground text-sm">Loading shorts...</p>
            </div>
          ) : reelsData.length > 0 && currentReel ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReel.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="h-full w-full relative"
                >
                  {/* Thumbnail/Video */}
                  <div className="absolute inset-0 bg-black">
                    {currentReel.mediaType === 'video' ? (
                      <video 
                        src={currentReel.thumbnail} 
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        ref={el => {
                           if (el) {
                             // We suppress play errors as browsers restrict autoplay without interaction
                             if (isPlaying) { el.play().catch(()=>setIsPlaying(false)) }
                             else { el.pause() }
                           }
                        }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentReel.thumbnail})` }}
                      />
                    )}
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
                      onClick={() => toggleLike(currentReel.id, currentReel.likes)}
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
                        {formatNumber(currentReel.likes)}
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
            </>
          ) : (
             <div className="flex flex-col h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">No shorts available.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AgriShorts;
