import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, UserPlus, UserCheck, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserResult {
  id: string;
  user_id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
}

const Search: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const searchUsers = async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, name, username, avatar_url, location, bio')
      .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
      .neq('user_id', user?.id || '')
      .limit(20);
    if (data) setResults(data);

    // Check follow status
    if (user && data && data.length > 0) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', data.map(u => u.user_id));
      if (follows) setFollowedIds(new Set(follows.map(f => f.following_id)));
    }
    setLoading(false);
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!user) return;
    if (followedIds.has(targetUserId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
      setFollowedIds(prev => { const n = new Set(prev); n.delete(targetUserId); return n; });
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
      setFollowedIds(prev => new Set([...prev, targetUserId]));
    }
  };

  const startConversation = async (targetUserId: string) => {
    if (!user) return;
    // Check if conversation already exists
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    
    if (existingParticipants) {
      for (const p of existingParticipants) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', p.conversation_id)
          .eq('user_id', targetUserId)
          .maybeSingle();
        if (otherParticipant) {
          navigate(`/messages?chat=${p.conversation_id}`);
          return;
        }
      }
    }

    // Create new conversation
    const { data: conv } = await supabase.from('conversations').insert({}).select().single();
    if (conv) {
      await supabase.from('conversation_participants').insert([
        { conversation_id: conv.id, user_id: user.id },
        { conversation_id: conv.id, user_id: targetUserId },
      ]);
      navigate(`/messages?chat=${conv.id}`);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-xl font-bold">{t('search')}</h1>
        
        <div className="clay-card p-2 rounded-2xl flex items-center gap-2">
          <SearchIcon size={20} className="text-muted-foreground ml-2" />
          <Input
            placeholder={t('searchUsers')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); searchUsers(e.target.value); }}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>

        {results.length === 0 && query.length >= 2 && !loading && (
          <div className="text-center py-12">
            <SearchIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">{t('noUsersFound')}</p>
          </div>
        )}

        {results.length === 0 && query.length < 2 && (
          <div className="text-center py-12">
            <SearchIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">{t('discoverFarmers')}</p>
          </div>
        )}

        <div className="space-y-2">
          {results.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ClayCard variant="hover" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : (
                    <span className="text-lg font-bold text-primary">{u.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{u.name}</p>
                  {u.username && <p className="text-xs text-primary font-medium">@{u.username}</p>}
                  {u.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} />{u.location}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleFollow(u.user_id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${followedIds.has(u.user_id) ? 'clay-inset text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                    {followedIds.has(u.user_id) ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => startConversation(u.user_id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold clay-card">
                    {t('message')}
                  </motion.button>
                </div>
              </ClayCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Search;
