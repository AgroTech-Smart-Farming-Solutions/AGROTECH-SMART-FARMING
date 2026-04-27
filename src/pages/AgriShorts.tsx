import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MessageCircle, ChevronUp, ChevronDown, Play, Volume2, VolumeX, Loader2, X, Send, User, Bookmark, UserPlus, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

interface Reel {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string; // NEW: Added to track who to follow
  likes: number;
  comments: number;
  shares: number;
  saved: number; 
  thumbnail: string;
  category: string;
  mediaType: string;
}

const AgriShorts: React.FC = () => {
  const { user } = useAuth();
  const { id: sharedReelId } = useParams();
  const navigate = useNavigate(); // Added for Profile Redirection
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set()); // NEW: Track followed authors
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reelsData, setReelsData] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTap, setLastTap] = useState(0); // Added for Double-Tap logic

  // States for Comments
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        
        let { data, error } = await (supabase as any)
          .from('posts')
          .select(`*, profiles(name, username)`)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Profile join failed, fetching raw posts instead:', error);
          const fallbackFetch = await (supabase as any)
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
            
          data = fallbackFetch.data;
          if (fallbackFetch.error) throw fallbackFetch.error;
        }

        if (data && data.length > 0) {
          const formattedReels = data.map((post: any) => {
            const profileData = post.profiles ? (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) : null;
            const mediaUrl = post.video_url || post.image_url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400';
            const isVideo = post.media_type === 'video' || !!post.video_url || mediaUrl.match(/\.(mp4|webm|ogg)$/i);

            return {
              id: post.id,
              title: post.caption ? post.caption.split('\n')[0] : 'Agri Shorts',
              description: post.caption || '',
              author: profileData?.username || profileData?.name || 'AgroTech Farmer',
              authorId: post.user_id, // NEW: Map Author ID
              likes: post.likes || 0,
              comments: post.comments_count || 0,
              shares: post.shares_count || 0,
              saved: post.saved_count || 0,
              thumbnail: mediaUrl,
              category: isVideo ? 'Shorts' : 'Community',
              mediaType: isVideo ? 'video' : 'image',
            };
          });
          
          setReelsData(formattedReels);

          if (user) {
            // Fetch Liked Posts
            const { data: likedData } = await (supabase as any)
              .from('post_likes')
              .select('post_id')
              .eq('user_id', user.id);
            
            if (likedData) {
              setLiked(new Set(likedData.map((l: any) => l.post_id)));
            }

            // Fetch Saved Posts
            const { data: savedData } = await (supabase as any)
              .from('saved_posts')
              .select('post_id')
              .eq('user_id', user.id);
            
            if (savedData) {
              setSavedPosts(new Set(savedData.map((s: any) => s.post_id)));
            }

            // NEW: Fetch Following Data
            const { data: followingData } = await (supabase as any)
              .from('follows')
              .select('following_id')
              .eq('follower_id', user.id);
            
            if (followingData) {
              setFollowing(new Set(followingData.map((f: any) => f.following_id)));
            }
          }
        } else {
          setReelsData([{
            id: 'fallback-1',
            title: 'Welcome to AgriShorts',
            description: 'No posts yet. Share your farming stories here!',
            author: 'AgroTech System',
            authorId: 'system',
            likes: 0,
            comments: 0,
            shares: 0,
            saved: 0,
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

  // Fetch comments when the bottom sheet opens
  useEffect(() => {
    const fetchComments = async () => {
      if (!showComments || !currentReel || currentReel.id === 'fallback-1') return;
      
      setIsLoadingComments(true);
      try {
        const { data, error } = await (supabase as any)
          .from('comments')
          .select(`*, profiles:user_id (name, username)`)
          .eq('post_id', currentReel.id)
          .order('created_at', { ascending: true });

        if (error) {
           console.warn('Could not load detailed comments:', error);
           setCommentsData([]);
        } else if (data) {
          setCommentsData(data);
        }
      } catch (err) {
        console.error('Comment fetch error:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [showComments, currentReel?.id]);

  // Auto-scroll to shared reel
  useEffect(() => {
    if (sharedReelId && reelsData.length > 0) {
      const targetIndex = reelsData.findIndex(reel => reel.id === sharedReelId);
      if (targetIndex !== -1) {
        setCurrentIndex(targetIndex);
      }
    }
  }, [sharedReelId, reelsData]);

  // NEW: INFINITE LOOP logic added here
  const goToNext = () => {
    if (reelsData.length <= 1) return;
    if (currentIndex < reelsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop to start
    }
    setShowComments(false);
  };

  // NEW: INFINITE LOOP logic added here
  const goToPrev = () => {
    if (reelsData.length <= 1) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(reelsData.length - 1); // Loop to end
    }
    setShowComments(false);
  };

  // NEW: Follow Toggle Function
  const toggleFollow = async (authorId: string) => {
    if (!user) { toast.error('Please login to follow'); return; }
    if (user.id === authorId) return; // Can't follow yourself

    const isFollowing = following.has(authorId);
    const newFollowing = new Set(following);
    
    if (isFollowing) newFollowing.delete(authorId);
    else newFollowing.add(authorId);
    
    setFollowing(newFollowing); // Optimistic update

    try {
      if (isFollowing) {
        await (supabase as any).from('follows').delete().eq('follower_id', user.id).eq('following_id', authorId);
        toast.success('Unfollowed user');
      } else {
        await (supabase as any).from('follows').insert([{ follower_id: user.id, following_id: authorId }]);
        toast.success('Following user!');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      if (isFollowing) newFollowing.add(authorId);
      else newFollowing.delete(authorId);
      setFollowing(newFollowing);
      toast.error('Failed to update follow status');
    }
  };

  const toggleLike = async (id: string, currentLikes: number) => {
    if (!user || id === 'fallback-1') {
      toast.error('Please login to like posts');
      return;
    }

    const isCurrentlyLiked = liked.has(id);
    const newLiked = new Set(liked);
    
    if (isCurrentlyLiked) newLiked.delete(id);
    else newLiked.add(id);
    setLiked(newLiked);

    try {
      if (isCurrentlyLiked) {
        await (supabase as any).from('post_likes').delete().eq('post_id', id).eq('user_id', user.id);
        setReelsData(prev => prev.map(reel => reel.id === id ? { ...reel, likes: Math.max(0, currentLikes - 1) } : reel));
      } else {
        await (supabase as any).from('post_likes').insert([{ post_id: id, user_id: user.id }]);
        setReelsData(prev => prev.map(reel => reel.id === id ? { ...reel, likes: currentLikes + 1 } : reel));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      if (isCurrentlyLiked) newLiked.add(id);
      else newLiked.delete(id);
      setLiked(newLiked);
      toast.error('Failed to update like');
    }
  };

  const toggleSave = async (id: string) => {
    if (!user || id === 'fallback-1') {
      toast.error('Please login to save posts');
      return;
    }

    const isCurrentlySaved = savedPosts.has(id);
    const currentSaveCount = currentReel.saved || 0;
    
    // UI Update
    const newSaved = new Set(savedPosts);
    if (isCurrentlySaved) newSaved.delete(id);
    else newSaved.add(id);
    setSavedPosts(newSaved);

    try {
      if (isCurrentlySaved) {
        await (supabase as any).from('saved_posts').delete().eq('post_id', id).eq('user_id', user.id);
        setReelsData(prev => prev.map(r => r.id === id ? { ...r, saved: Math.max(0, currentSaveCount - 1) } : r));
        toast.success('Removed from saved');
      } else {
        await (supabase as any).from('saved_posts').insert([{ post_id: id, user_id: user.id }]);
        setReelsData(prev => prev.map(r => r.id === id ? { ...r, saved: currentSaveCount + 1 } : r));
        toast.success('Post saved!');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      if (isCurrentlySaved) newSaved.add(id);
      else newSaved.delete(id);
      setSavedPosts(newSaved); 
      toast.error('Failed to update save');
    }
  };

  const handleShare = async (reel: Reel) => {
    if (reel.id === 'fallback-1') return;

    const uniqueShareUrl = `${window.location.origin}/reels/${reel.id}`;
    const shareData = {
      title: reel.title,
      text: `Check out this AgriShort by @${reel.author}: ${reel.title}`,
      url: uniqueShareUrl, 
    };

    try {
      let sharedSuccessfully = false;

      if (navigator.share) {
        await navigator.share(shareData);
        sharedSuccessfully = true;
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
        sharedSuccessfully = true;
      }

      if (sharedSuccessfully) {
        const { error } = await (supabase as any).rpc('increment_share_count', { p_id: reel.id });

        if (error) {
          console.error('Database share count failed:', error);
          toast.error('Share recorded, but failed to sync with server.');
          return; 
        }

        const newShareCount = reel.shares + 1;
        setReelsData(prev => prev.map(r => 
          r.id === reel.id ? { ...r, shares: newShareCount } : r
        ));
      }
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  };

  // 100% SAFE COMMENT SUBMIT: Removed complex joins and missing objects to prevent crashes!
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !currentReel || currentReel.id === 'fallback-1') {
      toast.error('Please login to comment');
      return;
    }
    
    const submittedText = commentText;
    setCommentText('');

    try {
      const { data, error } = await (supabase as any)
        .from('comments')
        .insert([{ post_id: currentReel.id, user_id: user.id, content: submittedText }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Comment posted!');
      
      // Build UI comment safely using basic user data
      const fallbackProfileName = user?.user_metadata?.name || 'AgroTech Farmer';
      const newComment = {
        ...data,
        profiles: {
          name: fallbackProfileName,
          username: fallbackProfileName
        }
      };
      
      const newCommentCount = currentReel.comments + 1;
      setCommentsData(prev => [...prev, newComment]);
      setReelsData(prev => prev.map(reel => 
        reel.id === currentReel.id ? { ...reel, comments: newCommentCount } : reel
      ));
    } catch (err) {
      console.error('Error saving comment:', err);
      toast.error('Failed to post comment.');
      setCommentText(submittedText);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return; 
      if (e.key === 'ArrowUp') goToPrev();
      if (e.key === 'ArrowDown') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reelsData.length, showComments]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] relative overflow-hidden">
        
        <div ref={containerRef} className="h-full w-full rounded-3xl overflow-hidden relative clay-card bg-black">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black cursor-pointer">
                    {currentReel.mediaType === 'video' ? (
                      <video 
                        src={currentReel.thumbnail} 
                        className="w-full h-full object-contain sm:object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        ref={el => {
                           if (el) {
                             if (isPlaying && !showComments) { el.play().catch(()=>setIsPlaying(false)) }
                             else { el.pause() }
                           }
                        }}
                      />
                    ) : (
                     <img 
                        src={currentReel.thumbnail} 
                        alt={currentReel.title}
                        className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 pointer-events-none" />
                  </div>

                  {/* Play/Pause overlay with Double-Tap Logic */}
                  <motion.button
                    onClick={(e) => {
                      if (showComments) return;
                      const now = Date.now();
                      if (now - lastTap < 300) {
                        toggleLike(currentReel.id, currentReel.likes);
                      } else {
                        setIsPlaying(!isPlaying);
                      }
                      setLastTap(now);
                    }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                    whileTap={{ scale: 0.95 }}
                    disabled={showComments}
                  >
                    <AnimatePresence>
                      {!isPlaying && !showComments && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center"
                        >
                          <Play size={32} className="text-foreground ml-2 sm:w-10 sm:h-10" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Content Overlay */}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 pb-6 z-20 w-[80%] transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <span className="px-2 py-1 rounded-full bg-primary/80 text-primary-foreground text-[10px] sm:text-xs font-medium">
                        {currentReel.category}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold mt-2 text-white drop-shadow-lg line-clamp-1">
                        {currentReel.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                        {currentReel.description}
                      </p>
                      
                      {/* USER PROFILE REDIRECTION & FIX FOLLOW BUTTON */}
                      <div className="flex items-center gap-3 mt-3">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (currentReel.authorId !== 'fallback-1' && currentReel.authorId !== 'system') {
                              navigate(`/profile/${currentReel.authorId}`);
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-white/20 flex items-center justify-center shrink-0 shadow-md">
                            <User size={16} className="text-white" />
                          </div>
                          <p className="text-sm text-white font-bold drop-shadow-md">
                            @{currentReel.author}
                          </p>
                        </div>

                        {user && user.id !== currentReel.authorId && currentReel.id !== 'fallback-1' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Stops video from pausing
                              toggleFollow(currentReel.authorId);
                            }}
                            className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm transition-all ${
                              following.has(currentReel.authorId) 
                                ? 'bg-black/30 backdrop-blur-md border-white/30 text-white hover:bg-black/50' 
                                : 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {following.has(currentReel.authorId) ? (
                              <><Check size={12} /> Following</>
                            ) : (
                              <><UserPlus size={12} /> Follow</>
                            )}
                          </button>
                        )}
                      </div>

                    </motion.div>
                  </div>

                  {/* RIGHT SIDEBAR CONTROLS */}
                  <div className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none transition-opacity duration-300 ${showComments ? 'opacity-0' : 'opacity-100'}`}>
                    
                    {/* Navigation Arrows (NEW INFINITE LOOP STYLING) */}
                    <div className="flex flex-col gap-1 sm:gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto mb-4 sm:mb-6">
                      <motion.button onClick={goToPrev} disabled={reelsData.length <= 1} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center disabled:opacity-30 text-white hover:bg-white/20 transition-colors">
                        <ChevronUp size={20} className="sm:w-6 sm:h-6 drop-shadow-md" />
                      </motion.button>
                      <div className="w-6 h-px bg-white/20 mx-auto" />
                      <motion.button onClick={goToNext} disabled={reelsData.length <= 1} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center disabled:opacity-30 text-white hover:bg-white/20 transition-colors">
                        <ChevronDown size={20} className="sm:w-6 sm:h-6 drop-shadow-md" />
                      </motion.button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-auto">
                      <motion.button onClick={(e) => { e.stopPropagation(); toggleLike(currentReel.id, currentReel.likes); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-white/10 shadow-lg transition-colors ${liked.has(currentReel.id) ? 'bg-destructive/90 backdrop-blur-md' : 'bg-black/40 backdrop-blur-md hover:bg-black/60'}`}>
                          <Heart size={20} className={`sm:w-5 sm:h-5 ${liked.has(currentReel.id) ? 'text-white fill-current' : 'text-white'}`} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">{formatNumber(currentReel.likes)}</span>
                      </motion.button>

                      <motion.button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center transition-colors">
                          <MessageCircle size={20} className="text-white sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">{formatNumber(currentReel.comments)}</span>
                      </motion.button>

                      <motion.button onClick={(e) => { e.stopPropagation(); handleShare(currentReel); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center transition-colors">
                          <Share2 size={20} className="text-white sm:w-5 sm:h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">{formatNumber(currentReel.shares)}</span>
                      </motion.button>

                      {/* Save Button */}
                      <motion.button onClick={(e) => { e.stopPropagation(); toggleSave(currentReel.id); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-white/10 shadow-lg transition-colors ${savedPosts.has(currentReel.id) ? 'bg-primary/90 backdrop-blur-md' : 'bg-black/40 backdrop-blur-md hover:bg-black/60'}`}>
                          <Bookmark size={20} className={`sm:w-5 sm:h-5 ${savedPosts.has(currentReel.id) ? 'text-white fill-current' : 'text-white'}`} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">
                          {formatNumber(currentReel.saved || 0)}
                        </span>
                      </motion.button>

                      <motion.button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex flex-col items-center mt-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-center transition-colors">
                          {isMuted ? <VolumeX size={20} className="text-white sm:w-5 sm:h-5" /> : <Volume2 size={20} className="text-white sm:w-5 sm:h-5" />}
                        </div>
                      </motion.button>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Progress Indicator */}
              <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                {reelsData.map((_, index) => (
                  <motion.div key={index} className={`w-1 rounded-full transition-all ${index === currentIndex ? 'bg-primary h-6 sm:h-8' : 'bg-background/50 h-3 sm:h-4'}`} />
                ))}
              </div>

              {/* ================= COMMENT BOTTOM SHEET ================= */}
              <AnimatePresence>
                {showComments && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowComments(false)}
                      className="absolute inset-0 bg-black/60 z-30"
                    />
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 left-0 right-0 h-[65%] bg-card rounded-t-3xl z-40 flex flex-col shadow-2xl border-t border-border"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                        <h3 className="font-bold text-lg">Comments ({currentReel.comments})</h3>
                        <button
                          type="button"
                          aria-label="Close comments"
                          onClick={() => setShowComments(false)}
                          className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
                          <X size={18} />
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {isLoadingComments ? (
                          <div className="flex-1 flex items-center justify-center text-muted-foreground">
                             <Loader2 size={24} className="animate-spin text-primary" />
                          </div>
                        ) : commentsData.length > 0 ? (
                           commentsData.map((comment, i) => (
                             <div key={comment.id || i} className="flex gap-3">
                               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                  <User size={16} className="text-primary" />
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-muted-foreground">
                                   @{comment.profiles?.username || comment.profiles?.name || 'User'}
                                 </span>
                                 <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                               </div>
                             </div>
                           ))
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
                            <MessageCircle size={40} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium text-center">No comments yet.</p>
                            <p className="text-xs text-center opacity-70">Start the conversation!</p>
                          </div>
                        )}
                      </div>

                      {/* Input Area */}
                      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm shrink-0">
                        <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button 
                            type="submit"
                            aria-label="Post comment"
                            disabled={!commentText.trim()}
                            className="bg-primary text-primary-foreground w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
                          >
                            <Send size={18} className="ml-0.5" />
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            </>
          ) : (
             <div className="flex flex-col h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">No shorts available yet.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AgriShorts;