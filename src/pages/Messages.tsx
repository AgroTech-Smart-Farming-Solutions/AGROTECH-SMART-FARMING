import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  otherUser: { name: string; username: string | null; avatar_url: string | null; user_id: string };
  lastMessage?: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Messages: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<Conversation['otherUser'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    if (chatId) {
      loadMessages(chatId);
      loadChatPartner(chatId);

      // Subscribe to realtime messages
      const channel = supabase
        .channel(`messages-${chatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${chatId}` },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      loadConversations();
    }
  }, [user, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    if (!participants || participants.length === 0) return;

    const convIds = participants.map(p => p.conversation_id);
    const convs: Conversation[] = [];

    for (const convId of convIds) {
      const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convId)
        .neq('user_id', user.id);
      
      if (otherParticipants && otherParticipants[0]) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, username, avatar_url, user_id')
          .eq('user_id', otherParticipants[0].user_id)
          .single();

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (profile) {
          convs.push({
            id: convId,
            otherUser: profile,
            lastMessage: lastMsg?.content,
            updatedAt: lastMsg?.created_at || '',
          });
        }
      }
    }
    setConversations(convs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const loadChatPartner = async (convId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', convId)
      .neq('user_id', user.id)
      .maybeSingle();
    if (data) {
      const { data: profile } = await supabase.from('profiles').select('name, username, avatar_url, user_id').eq('user_id', data.user_id).single();
      if (profile) setChatPartner(profile);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user) return;
    await supabase.from('messages').insert({
      conversation_id: chatId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  // Chat view
  if (chatId) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] flex flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/messages')} className="w-10 h-10 rounded-xl clay-card flex items-center justify-center">
              <ArrowLeft size={18} />
            </motion.button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {chatPartner?.avatar_url ? <img src={chatPartner.avatar_url} className="w-full h-full object-cover" /> : (
                <span className="font-bold text-primary">{chatPartner?.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{chatPartner?.name || '...'}</p>
              {chatPartner?.username && <p className="text-xs text-primary">@{chatPartner.username}</p>}
            </div>
          </div>

          {/* Messages */}
          <ClayCard className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'clay-inset rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ClayCard>

          {/* Input */}
          <div className="clay-card p-2 mt-3 flex items-center gap-2">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('typeMessage')} className="flex-1 border-0 bg-transparent focus-visible:ring-0" />
            <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} disabled={!newMessage.trim()}
              className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Conversation list view
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-xl font-bold">{t('messages')}</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">{t('noMessages')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{t('startConversation')}</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/search')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
              {t('search')}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, i) => (
              <motion.div key={conv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ClayCard variant="hover" className="cursor-pointer" onClick={() => navigate(`/messages?chat=${conv.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {conv.otherUser.avatar_url ? <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" /> : (
                        <span className="text-lg font-bold text-primary">{conv.otherUser.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{conv.otherUser.name}</p>
                      {conv.lastMessage && <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>}
                    </div>
                    {conv.updatedAt && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </ClayCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Messages;
