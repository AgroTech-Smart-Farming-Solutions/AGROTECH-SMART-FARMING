import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, LogOut, Crown, Camera, Grid3X3, Bookmark, 
  Plus, CheckCircle2, Share2, Loader2, X, 
  UploadCloud, Sprout, PlusSquare, Music, Layers, UserPlus, Check, User
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TabType = 'posts' | 'saved';

const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, profile, logout, uploadAvatar, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const { id: routeId } = useParams();
  const isOwnProfile = !routeId || routeId === user?.id;
  const targetUserId = routeId || user?.id;

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  
  const [displayProfile, setDisplayProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Network Modal States (Followers / Following List)
  const [showNetworkModal, setShowNetworkModal] = useState<'followers' | 'following' | null>(null);
  const [networkList, setNetworkList] = useState<any[]>([]);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', username: '', bio: '', location: '', farm_size: '', primary_crops: ''
  });

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostMediaFiles, setNewPostMediaFiles] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [newPostMediaType, setNewPostMediaType] = useState<'image' | 'video'>('image');
  const [newPostAudio, setNewPostAudio] = useState<File | null>(null);
  const [newPostAudioPreview, setNewPostAudioPreview] = useState<string | null>(null);
  const [postingNew, setPostingNew] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);
  const postAudioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!targetUserId) return;

    const loadProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        if (isOwnProfile) {
          setDisplayProfile(profile);
        } else {
          const { data } = await (supabase as any).from('profiles').select('*').eq('user_id', targetUserId).single();
          setDisplayProfile(data);
          
          if (user) {
            const { data: followData } = await (supabase as any).from('follows')
              .select('*').eq('follower_id', user.id).eq('following_id', targetUserId).single();
            setIsFollowing(!!followData);
          }
        }

        const { data: postsData } = await (supabase as any).from('posts').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false });
        if (postsData) setPosts(postsData);

        try {
          const { data: countsData } = await (supabase as any).rpc('get_follow_counts', { _user_id: targetUserId });
          if (countsData && countsData[0]) setFollowCounts({ followers: Number(countsData[0].followers_count), following: Number(countsData[0].following_count) });
        } catch (e) { console.log('Followers table not ready'); }

        if (isOwnProfile) {
          const { data: savedData } = await (supabase as any).from('saved_posts').select('*, posts(*)').eq('user_id', targetUserId).order('created_at', { ascending: false });
          if (savedData) setSavedPosts(savedData);
        }

      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error("Profile not found");
        navigate('/profile'); 
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, targetUserId, isOwnProfile, profile]);

  useEffect(() => {
    if (showEditProfile && profile) {
      setEditForm({
        name: profile.name || '', username: (profile as any).username || '',
        bio: profile.bio || '', location: profile.location || '',
        farm_size: profile.farm_size || '', primary_crops: profile.primary_crops ? profile.primary_crops.join(', ') : ''
      });
    }
  }, [showEditProfile, profile]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const toggleFollow = async () => {
    if (!user || isOwnProfile) return;
    try {
      if (isFollowing) {
        await (supabase as any).from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
        setIsFollowing(false);
        setFollowCounts(prev => ({...prev, followers: Math.max(0, prev.followers - 1)}));
        toast.success(`Unfollowed ${displayProfile?.name}`);
      } else {
        await (supabase as any).from('follows').insert([{ follower_id: user.id, following_id: targetUserId }]);
        setIsFollowing(true);
        setFollowCounts(prev => ({...prev, followers: prev.followers + 1}));
        toast.success(`Following ${displayProfile?.name}`);
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const openNetworkModal = async (type: 'followers' | 'following') => {
    setShowNetworkModal(type);
    setIsLoadingNetwork(true);
    setNetworkList([]);
    
    try {
      const columnToMatch = type === 'followers' ? 'following_id' : 'follower_id';
      const columnToSelect = type === 'followers' ? 'follower_id' : 'following_id';
      
      const { data: followsData, error: followsError } = await (supabase as any)
        .from('follows')
        .select(columnToSelect)
        .eq(columnToMatch, targetUserId);
        
      if (followsError) throw followsError;
      
      if (followsData && followsData.length > 0) {
        const ids = followsData.map((f: any) => f[columnToSelect]);
        const { data: profilesData, error: profilesError } = await (supabase as any)
          .from('profiles')
          .select('user_id, name, username, avatar_url')
          .in('user_id', ids); 
          
        if (profilesError) throw profilesError;
        if (profilesData) setNetworkList(profilesData);
      }
    } catch (err) {
      console.error('Error fetching network:', err);
      toast.error(`Failed to load ${type} list`);
    } finally {
      setIsLoadingNetwork(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const handleNewPostMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const hasVideo = files.some(f => f.type.startsWith('video'));
    if (hasVideo && files.length > 1) {
      toast.error(t('singleVideoOnly') || 'You can only select 1 video per post.');
      return;
    }
    setNewPostMediaFiles(files);
    setNewPostPreviews(files.map(f => URL.createObjectURL(f)));
    setNewPostMediaType(hasVideo ? 'video' : 'image');
  };

  const handleNewPostAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPostAudio(file);
    setNewPostAudioPreview(URL.createObjectURL(file));
  };

  const resetNewPost = () => {
    setShowNewPost(false);
    setNewPostCaption('');
    setNewPostMediaFiles([]);
    setNewPostPreviews([]);
    setNewPostAudio(null);
    setNewPostAudioPreview(null);
  };

  const createPost = async () => {
    if (!user || (!newPostCaption.trim() && !newPostMediaFiles.length)) return;
    setPostingNew(true);
    try {
      const uploadedMediaUrls = [];
      for (const file of newPostMediaFiles) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/media_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('post-images').getPublicUrl(path);
          uploadedMediaUrls.push(data.publicUrl);
        }
      }

      let audioUrl = null;
      if (newPostAudio) {
        const ext = newPostAudio.name.split('.').pop();
        const path = `${user.id}/audio_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error } = await supabase.storage.from('post-images').upload(path, newPostAudio, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from('post-images').getPublicUrl(path);
          audioUrl = data.publicUrl;
        }
      }

      await (supabase as any).from('posts').insert({ 
        user_id: user.id, caption: newPostCaption || null, image_url: uploadedMediaUrls[0] || null, 
        media_urls: uploadedMediaUrls, audio_url: audioUrl, media_type: newPostMediaType 
      });

      resetNewPost();
      window.location.reload(); 
      toast.success(t('postedSuccessfully') || 'Post created successfully!');
    } catch (error) {
      toast.error('Failed to upload post');
    } finally {
      setPostingNew(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setUpdatingProfile(true);
    try {
      const cropsArray = editForm.primary_crops ? editForm.primary_crops.split(',').map(c => c.trim()).filter(Boolean) : [];
      const { error } = await (supabase as any).from('profiles').upsert({
        user_id: user.id, name: editForm.name, username: editForm.username, bio: editForm.bio,
        location: editForm.location, farm_size: editForm.farm_size, primary_crops: cropsArray
      }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Profile updated successfully!');
      setShowEditProfile(false);
      
      if (typeof refreshProfile === 'function') await refreshProfile();
      else window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${targetUserId}`;
    const shareData = {
      title: `${displayProfile?.name || 'AgroTech Farmer'}'s Profile`,
      text: `Check out ${displayProfile?.name || 'this farmer'}'s profile and shorts on AgroTech! 🌱`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing profile:', err);
        toast.error('Failed to share profile');
      }
    }
  };

  if (isLoadingProfile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-2xl mx-auto bg-background min-h-screen pb-20">
        
        {isOwnProfile && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <input ref={postImageRef} type="file" accept="image/*,video/*" multiple onChange={handleNewPostMedia} className="hidden" />
            <input ref={postAudioRef} type="file" accept="audio/*" onChange={handleNewPostAudio} className="hidden" />
          </>
        )}

        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-md z-30 border-b border-border/40">
          <div className="flex items-center gap-1.5 font-bold text-lg sm:text-xl text-foreground">
            @{displayProfile?.username || 'farmer_' + targetUserId.substring(0, 5)}
            {isOwnProfile && <Crown size={16} className="text-amber-500" />}
          </div>
          
          {isOwnProfile && (
            <div className="flex items-center gap-4 text-foreground">
              <button onClick={() => setShowNewPost(true)} className="hover:opacity-70 transition"><PlusSquare size={24} /></button>
              <button onClick={handleLogout} className="hover:text-destructive transition"><LogOut size={24} /></button>
            </div>
          )}
        </div>

        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-border p-1">
                <div className={`w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center ${isOwnProfile ? 'cursor-pointer' : ''}`} onClick={() => isOwnProfile && fileInputRef.current?.click()}>
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  ) : displayProfile?.avatar_url ? (
                    <img src={displayProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl sm:text-4xl font-bold text-muted-foreground">{displayProfile?.name?.charAt(0).toUpperCase() || '?'}</span>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-primary text-primary-foreground rounded-full p-1.5 border-2 border-background shadow-sm">
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-1 justify-center gap-6 sm:gap-10">
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg sm:text-xl text-foreground">{posts.length}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground">{t('posts') || 'Posts'}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openNetworkModal('followers')}>
                <span className="font-bold text-lg sm:text-xl text-foreground">{followCounts.followers}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground">{t('followers') || 'Followers'}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openNetworkModal('following')}>
                <span className="font-bold text-lg sm:text-xl text-foreground">{followCounts.following}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground">{t('following') || 'Following'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 space-y-1">
            <h1 className="font-bold text-sm sm:text-base text-foreground">{displayProfile?.name || 'AgroTech Farmer'}</h1>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{displayProfile?.bio || 'Passionate farmer building the future of agriculture. 🌱'}</p>
            
            {/* 🚀 FIXED: Badges now use pure primary color with 15% opacity! */}
            <div className="flex flex-wrap gap-2 mt-2 pt-1 text-[11px] sm:text-xs font-medium">
              {displayProfile?.location && (
                <span className="flex items-center gap-1 bg-primary/15 text-primary font-bold px-2 py-1 rounded-md"><MapPin size={12} /> {displayProfile.location}</span>
              )}
              {displayProfile?.farm_size && (
                <span className="flex items-center gap-1 bg-primary/15 text-primary font-bold px-2 py-1 rounded-md">• {displayProfile.farm_size}</span>
              )}
            </div>
            {displayProfile?.primary_crops && displayProfile.primary_crops.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] sm:text-xs bg-primary/15 text-primary font-bold px-2 py-1 rounded-md w-fit">
                <Sprout size={12} /> {displayProfile.primary_crops.join(', ')}
              </div>
            )}
          </div>

          {/* 🚀 FIXED: Buttons now use pure primary colors! */}
          <div className="flex gap-2 mt-5">
            {isOwnProfile ? (
              <button onClick={() => setShowEditProfile(true)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors shadow-sm">
                {t('editProfile') || 'Edit Profile'}
              </button>
            ) : (
              <button onClick={toggleFollow} className={`flex-1 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 shadow-sm ${isFollowing ? 'bg-primary/15 text-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                {isFollowing ? <Check size={16}/> : <UserPlus size={16}/>} {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            
            <button onClick={handleShareProfile} className="flex-1 border-2 border-primary text-primary hover:bg-primary/10 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors">
              {t('shareProfile') || 'Share Profile'}
            </button>
          </div>
        </div>

        {/* Network List Modal */}
        <AnimatePresence>
          {showNetworkModal && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
              <ClayCard className="w-full max-w-sm border border-border shadow-2xl p-5 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50 shrink-0">
                  <h3 className="font-bold text-lg text-foreground capitalize">{showNetworkModal}</h3>
                  <button onClick={() => setShowNetworkModal(null)} className="p-1.5 hover:bg-muted rounded-full transition"><X size={20} className="text-muted-foreground" /></button>
                </div>
                
                <div className="overflow-y-auto flex-1 flex flex-col gap-3 min-h-[50px] hide-scrollbar">
                  {isLoadingNetwork ? (
                    <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
                  ) : networkList.length > 0 ? (
                    networkList.map((person) => (
                      <div 
                        key={person.user_id} 
                        onClick={() => { 
                          setShowNetworkModal(null); 
                          navigate(`/profile/${person.user_id}`); 
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border shadow-sm">
                          {person.avatar_url ? (
                            <img src={person.avatar_url} alt={person.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-bold text-foreground truncate">{person.username || person.name || 'AgroTech User'}</span>
                          <span className="text-xs text-muted-foreground truncate">{person.name || ''}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 flex flex-col items-center justify-center">
                      <UserPlus size={40} className="text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm font-medium">No {showNetworkModal} yet.</p>
                    </div>
                  )}
                </div>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {showEditProfile && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
              <ClayCard className="w-full max-w-md border border-border shadow-2xl overflow-y-auto max-h-[90vh] p-5">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50">
                  <h3 className="font-bold text-lg text-foreground">{t('editProfile') || 'Edit Profile'}</h3>
                  <button onClick={() => setShowEditProfile(false)} className="p-1.5 hover:bg-muted rounded-full transition"><X size={20} className="text-muted-foreground" /></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Full Name</label>
                    <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} placeholder="Your Name" className="mt-1 bg-background border-border text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Username</label>
                    <Input value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} placeholder="Username" className="mt-1 bg-background border-border text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Bio</label>
                    <Textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} placeholder="Write a short bio..." className="mt-1 resize-none bg-background border-border text-foreground" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Location</label>
                      <Input value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} placeholder="E.g. Punjab, India" className="mt-1 bg-background border-border text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Farm Size</label>
                      <Input value={editForm.farm_size} onChange={(e) => setEditForm({...editForm, farm_size: e.target.value})} placeholder="E.g. 5 Acres" className="mt-1 bg-background border-border text-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Primary Crops (Comma separated)</label>
                    <Input value={editForm.primary_crops} onChange={(e) => setEditForm({...editForm, primary_crops: e.target.value})} placeholder="Wheat, Sugarcane, Rice" className="mt-1 bg-background border-border text-foreground" />
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={updatingProfile} className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50">
                  {updatingProfile ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Post Modal */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
              <ClayCard className="w-full max-w-md border border-border shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                  <h3 className="font-bold text-base text-foreground">{t('newPost') || 'Create New Post'}</h3>
                  <button onClick={resetNewPost} className="p-1 hover:bg-muted rounded-full"><X size={20} className="text-muted-foreground" /></button>
                </div>
                
                {newPostPreviews.length > 0 ? (
                  <div className="flex overflow-x-auto gap-2 snap-x mb-4 pb-2 hide-scrollbar">
                    {newPostPreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-full aspect-square shrink-0 snap-center bg-black rounded-lg overflow-hidden border border-border">
                        {newPostMediaType === 'video' ? (
                          <video src={preview} controls className="w-full h-full object-contain" />
                        ) : (
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {idx + 1}/{newPostPreviews.length}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div onClick={() => postImageRef.current?.click()} className="w-full aspect-video bg-muted border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 mb-4 cursor-pointer hover:bg-muted/80 transition">
                    <UploadCloud size={32} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground text-center">
                      {t('uploadMedia') || 'Upload Photos or Video'}<br/>
                      <span className="text-xs text-muted-foreground font-normal">(Select multiple photos allowed)</span>
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  {newPostAudioPreview ? (
                    <div className="flex flex-col gap-2 p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold flex items-center gap-2 text-foreground"><Music size={14} className="text-muted-foreground" /> {newPostAudio?.name}</span>
                        <button onClick={() => { setNewPostAudio(null); setNewPostAudioPreview(null); }} className="text-destructive"><X size={16} /></button>
                      </div>
                      <audio src={newPostAudioPreview} controls className="w-full h-8" />
                    </div>
                  ) : (
                    <button onClick={() => postAudioRef.current?.click()} className="w-full py-2 border border-border border-dashed rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted transition">
                      <Music size={16} /> Add Music / Audio
                    </button>
                  )}
                </div>

                <Textarea placeholder={t('addCaption') || 'Write a caption...'} value={newPostCaption} onChange={(e) => setNewPostCaption(e.target.value)} className="bg-background border border-border resize-none text-sm mb-4 focus-visible:ring-1 focus-visible:ring-primary text-foreground" rows={3} />
                
                <button onClick={createPost} disabled={postingNew || (!newPostMediaFiles.length && !newPostCaption)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {postingNew ? <Loader2 size={16} className="animate-spin" /> : <PlusSquare size={16} />}
                  {postingNew ? t('posting') || 'Sharing...' : t('share') || 'Share Post'}
                </button>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2 border-t border-border">
          <div className="flex w-full">
            <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors relative text-sm uppercase tracking-widest font-semibold ${activeTab === 'posts' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <Grid3X3 size={16} /> <span className="hidden sm:inline">{t('posts') || 'POSTS'}</span>
              {activeTab === 'posts' && <motion.div layoutId="ig-tab" className="absolute top-0 left-0 right-0 h-[2px] bg-foreground" />}
            </button>
            {isOwnProfile && (
              <button onClick={() => setActiveTab('saved')} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors relative text-sm uppercase tracking-widest font-semibold ${activeTab === 'saved' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <Bookmark size={16} /> <span className="hidden sm:inline">{t('saved') || 'SAVED'}</span>
                {activeTab === 'saved' && <motion.div layoutId="ig-tab" className="absolute top-0 left-0 right-0 h-[2px] bg-foreground" />}
              </button>
            )}
          </div>
        </div>

        <div className="pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center mb-4"><Camera size={28} /></div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">{t('noPostsYet') || 'No Posts Yet'}</h2>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                    {posts.map((post) => (
                      <div 
                        key={post.id} 
                        onClick={() => navigate(`/reels/${post.id}`)}
                        className="aspect-square bg-muted relative group cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        {(post as any).media_type === 'video' && post.image_url ? (
                          <video src={post.image_url} className="w-full h-full object-cover" />
                        ) : post.image_url ? (
                          <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2"><p className="text-[10px] text-center line-clamp-3 text-muted-foreground">{post.caption}</p></div>
                        )}
                        
                        {post.media_urls && post.media_urls.length > 1 && (
                          <div className="absolute top-2 right-2 drop-shadow-md text-white">
                            <Layers size={16} className="fill-current/80" />
                          </div>
                        )}
                        
                        {post.audio_url && (
                          <div className="absolute bottom-2 left-2 drop-shadow-md text-white bg-black/40 p-1 rounded-full backdrop-blur-sm">
                            <Music size={12} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {isOwnProfile && activeTab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {savedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center mb-4"><Bookmark size={28} /></div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Saved Shorts</h2>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                    {savedPosts.map((saved: any) => (
                      <div 
                        key={saved.id} 
                        onClick={() => navigate(`/reels/${saved.post_id || saved.posts?.id}`)}
                        className="aspect-square bg-muted relative group cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        {saved.posts?.media_type === 'video' && saved.posts?.image_url ? (
                            <video src={saved.posts.image_url} className="w-full h-full object-cover" />
                        ) : saved.posts?.image_url && (
                            <img src={saved.posts.image_url} alt="Saved" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </AppLayout>
  );
};

export default Profile;