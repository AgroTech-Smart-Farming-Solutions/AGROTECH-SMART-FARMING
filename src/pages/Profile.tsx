import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Settings, LogOut, Crown, Camera, Grid3X3, Bookmark, Heart, Plus, Edit3, CheckCircle2, Share2, Image, Loader2, X, ImagePlus
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import logoImg from '@/assets/logo.png';

type TabType = 'posts' | 'saved';

const Profile: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile, logout, uploadAvatar, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<{ id: string; image_url: string | null; caption: string | null; likes: number }[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostPreview, setNewPostPreview] = useState<string | null>(null);
  const [postingNew, setPostingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'en' as const, label: 'English' },
    { code: 'hi' as const, label: 'हिंदी' },
    { code: 'mr' as const, label: 'मराठी' },
    { code: 'pa' as const, label: 'ਪੰਜਾਬੀ' },
    { code: 'ta' as const, label: 'தமிழ்' },
    { code: 'te' as const, label: 'తెలుగు' },
    { code: 'bn' as const, label: 'বাংলা' },
    { code: 'gu' as const, label: 'ગુજરાતી' },
  ];

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchPosts();
    fetchFollowCounts();
    fetchSavedPosts();
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    if (!user) return;
    const { data } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const fetchFollowCounts = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('get_follow_counts', { _user_id: user.id });
    if (data && data[0]) setFollowCounts({ followers: Number(data[0].followers_count), following: Number(data[0].following_count) });
  };

  const fetchSavedPosts = async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_posts').select('*, posts(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setSavedPosts(data);
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const handleNewPostImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPostImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const createPost = async () => {
    if (!user || (!newPostCaption.trim() && !newPostImage)) return;
    setPostingNew(true);
    let imageUrl: string | null = null;
    if (newPostImage) {
      const ext = newPostImage.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('post-images').upload(path, newPostImage, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
    }
    await supabase.from('posts').insert({ user_id: user.id, caption: newPostCaption || null, image_url: imageUrl });
    setNewPostCaption('');
    setNewPostImage(null);
    setNewPostPreview(null);
    setShowNewPost(false);
    setPostingNew(false);
    fetchPosts();
  };

  const stats = [
    { label: t('posts'), value: posts.length },
    { label: t('followers'), value: followCounts.followers },
    { label: t('following'), value: followCounts.following },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        <input ref={postImageRef} type="file" accept="image/*" onChange={handleNewPostImage} className="hidden" />

        {/* Profile Header */}
        <ClayCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary/25 via-emerald/15 to-accent/20" />
          <div className="relative pt-10 px-1">
            <div className="flex items-end gap-4 mb-4">
              <div className="relative -mt-14">
                <motion.div whileHover={{ scale: 1.05 }} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary to-emerald p-[3px] shadow-xl" style={{ boxShadow: '0 6px 20px hsl(var(--primary) / 0.25)' }}>
                  <div className="w-full h-full rounded-[21px] bg-card flex items-center justify-center overflow-hidden">
                    {uploading ? <Loader2 size={32} className="animate-spin text-primary" /> : profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-bold text-primary">{profile?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                </motion.div>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-card">
                  <Camera size={15} />
                </motion.button>
              </div>
              <div className="flex-1 flex justify-around pb-2">
                {stats.map((stat, index) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">{profile?.name || 'User'}</h1>
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              {(profile as any)?.username && (
                <p className="text-xs text-primary font-semibold">@{(profile as any).username}</p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin size={12} />
                {profile?.location || t('locationNotSet')} {profile?.farm_size ? `• ${profile.farm_size}` : ''}
              </p>
              <p className="text-xs sm:text-sm text-foreground/80 mt-2">{profile?.bio || '🌾 Passionate farmer using AgroTech 🌱'}</p>
            </div>

            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowNewPost(true)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald text-primary-foreground shadow-lg font-semibold text-sm flex items-center justify-center gap-1">
                <Plus size={16} /> {t('newPost')}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/messages')}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm clay-card">{t('messages')}</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-11 h-11 rounded-xl clay-card flex items-center justify-center"><Share2 size={18} /></motion.button>
            </div>

            {profile?.primary_crops && profile.primary_crops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex gap-2 flex-wrap">
                  {profile.primary_crops.map((crop, index) => (
                    <motion.span key={crop} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      🌾 {crop}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ClayCard>

        {/* New Post Modal */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <ClayCard className="border-2 border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">{t('newPost')}</h3>
                  <button onClick={() => { setShowNewPost(false); setNewPostPreview(null); setNewPostImage(null); }}><X size={18} className="text-muted-foreground" /></button>
                </div>
                {newPostPreview && (
                  <img src={newPostPreview} alt="Preview" className="w-full aspect-square object-cover rounded-xl mb-3" />
                )}
                <Textarea placeholder={t('addCaption')} value={newPostCaption} onChange={(e) => setNewPostCaption(e.target.value)} className="clay-inset border-0 mb-3" rows={2} />
                <div className="flex gap-2">
                  <ClayButton onClick={() => postImageRef.current?.click()} variant="secondary" className="flex items-center gap-1 text-xs">
                    <ImagePlus size={16} /> {t('selectImage')}
                  </ClayButton>
                  <ClayButton onClick={createPost} variant="primary" className="flex-1 flex items-center justify-center gap-1 text-xs" disabled={postingNew}>
                    {postingNew ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {postingNew ? t('posting') : t('newPost')}
                  </ClayButton>
                </div>
              </ClayCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex rounded-2xl clay-card p-1">
          {([
            { key: 'posts' as TabType, icon: Grid3X3, label: t('posts') },
            { key: 'saved' as TabType, icon: Bookmark, label: t('saved') },
          ]).map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all ${activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                whileTap={{ scale: 0.95 }}>
                <Icon size={18} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <Image size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm">{t('noPostsYet')}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{t('shareJourney')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {posts.map((post, index) => (
                    <motion.div key={post.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.caption || 'Post'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center p-2">
                          <p className="text-xs text-muted-foreground text-center line-clamp-4">{post.caption}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-1 text-primary-foreground font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart size={18} fill="currentColor" /><span>{post.likes}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm">{t('noSavedItems')}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{t('saveTip')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {savedPosts.map((saved: any, index: number) => (
                    <motion.div key={saved.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group">
                      {saved.posts?.image_url && <img src={saved.posts.image_url} alt="" className="w-full h-full object-cover" />}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <ClayCard>
          <div className="flex items-center gap-3 mb-4"><Settings size={18} className="text-muted-foreground" /><h3 className="font-bold text-sm">{t('settings')}</h3></div>
          <p className="text-xs text-muted-foreground mb-2">{t('language')}</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {languages.map((lang) => (
              <motion.button key={lang.code} onClick={() => setLanguage(lang.code)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all ${language === lang.code ? 'bg-primary/10 text-primary border border-primary/30' : 'clay-card text-muted-foreground hover:text-foreground'}`}>
                {lang.label}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 py-3 rounded-xl clay-card flex items-center justify-center gap-2 text-sm font-medium">
              <Edit3 size={16} /> {t('editProfile')}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/subscription')}
              className="flex-1 py-3 rounded-xl bg-accent/15 flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground">
              <Crown size={16} /> {t('upgradePro')}
            </motion.button>
          </div>
        </ClayCard>

        {/* Logout */}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleLogout}
          className="w-full py-4 rounded-2xl clay-card flex items-center justify-center gap-2 text-destructive font-semibold">
          <LogOut size={18} /> {t('logout')}
        </motion.button>

        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logoImg} alt="AgroTech" className="w-5 h-5" />
            <span className="font-bold text-sm">AgroTech</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Version 2.0.0 • Made with 💚 in India</p>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Profile;
