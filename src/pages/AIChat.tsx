import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, User, Bot, Sparkles, Loader2, Crown, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
// import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import aiFarmImg from '@/assets/ai-farm.jpg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [creditInfo, setCreditInfo] = useState<{ allowed: boolean; remaining: number; isPremium: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkCredits, deductCredit } = useCredits();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkCredits('ai').then(setCreditInfo);
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);


  const sendMessage = async () => {
  if (!inputText.trim() || isLoading) return;

  const credits = await checkCredits('ai');
  setCreditInfo(credits);
  if (!credits.allowed) return;

  const userMessage: Message = {
    id: Date.now().toString(), role: 'user', content: inputText, timestamp: new Date(),
  };
  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setIsLoading(true);

  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY_CHAT;

    const langMap: Record<string, string> = {
      en: "English", hi: "Hindi", mr: "Marathi", pa: "Punjabi",
      ta: "Tamil", te: "Telugu", bn: "Bengali", gu: "Gujarati",
    };
    const langName = langMap[language] || "English";

    // --- REPLACE YOUR SYSTEM PROMPT WITH THIS ---
    const systemPrompt = `You are "Kisan Sahayak" (किसान सहायक), an expert AI farming assistant for Indian farmers. 
    You have deep knowledge about crop cultivation, irrigation, soil health, pest and disease management, 
    Government schemes (PM-KISAN, PMFBY, KCC), market prices, organic farming, and modern techniques.
    IMPORTANT RULES: 
    1. You MUST respond entirely in the ${langName} language. Do not use English unless explicitly asked.
    2. Give practical advice in simple language. 
    3. Keep responses concise (2-4 paragraphs). 
    4. Use markdown formatting.`;

    // Convert history to Gemini format
    const chatHistory = [...messages, userMessage];
    const geminiContents = chatHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      // ✅ Correct
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || 'Sorry, I could not generate a response.';

    await deductCredit('ai');
    const updatedCredits = await checkCredits('ai');
    setCreditInfo(updatedCredits);

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    }]);

  } catch (err) {
    console.error('AI Chat error:', err);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '⚠️ Sorry, I encountered an error. Please try again.',
      timestamp: new Date(),
    }]);
  } finally {
    setIsLoading(false);
  }
};

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'pa' ? 'pa-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : language === 'bn' ? 'bn-IN' : language === 'gu' ? 'gu-IN' : 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  // const toggleListening = () => {
  //   if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
  //   if (isListening) { setIsListening(false); return; }
  //   setIsListening(true);
  //   const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  //   const recognition = new SpeechRecognition();
  //   recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'pa' ? 'pa-IN' : 'en-US';
  //   recognition.continuous = false;
  //   recognition.onresult = (event: any) => { setInputText(event.results[0][0].transcript); setIsListening(false); };
  //   recognition.onerror = () => setIsListening(false);
  //   recognition.onend = () => setIsListening(false);
  //   recognition.start();
  // };

  const toggleListening = () => {
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in your browser. Please use Chrome.');
    return;
  }

  if (isListening) {
    recognitionRef.current?.stop();
    setIsListening(false);
    return;
  }

  const recognition = new SpeechRecognition();
  recognitionRef.current = recognition;

  recognition.lang = 
    language === 'hi' ? 'hi-IN' : 
    language === 'mr' ? 'mr-IN' : 
    language === 'pa' ? 'pa-IN' : 
    language === 'ta' ? 'ta-IN' :
    language === 'te' ? 'te-IN' :
    language === 'bn' ? 'bn-IN' :
    language === 'gu' ? 'gu-IN' : 'en-US';

  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => setIsListening(true);

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log('Transcript:', transcript); 
    setInputText(transcript);
    setIsListening(false);
  };

  recognition.onerror = (event: any) => {
    console.error('Speech error:', event.error);
    if (event.error === 'not-allowed') {
      alert('Microphone permission denied. Please allow microphone access in your browser settings.');
    }
    setIsListening(false);
  };

  recognition.onend = () => setIsListening(false);

  recognition.start();
};

  // --- REPLACE YOUR QUICK PROMPTS WITH THIS ---
  const quickPrompts = [
    { emoji: '🌾', text: t('sowWheat') },
    { emoji: '🐛', text: t('controlPests') },
    { emoji: '💧', text: t('irrigationMethods') },
    { emoji: '🏛️', text: t('pmKisanDetails') },
  ];

  const noCredits = creditInfo && !creditInfo.allowed && !creditInfo.isPremium;

  return (
    <AppLayout>
      <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="relative rounded-2xl overflow-hidden mb-4">
            <img src={aiFarmImg} alt="AI Farm" className="w-full h-28 sm:h-36 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t('aiAssistant')}</h1>
                  <p className="text-xs text-muted-foreground">{t('kisanSahayak')}</p>
                </div>
              </div>
              {/* Credit Badge */}
              {creditInfo && !creditInfo.isPremium && (
                <div className="flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-bold">{creditInfo.remaining}</span>
                  <span className="text-[10px] text-muted-foreground">credits</span>
                </div>
              )}
              {creditInfo?.isPremium && (
                <div className="flex items-center gap-1.5 bg-accent/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Crown size={14} className="text-accent-foreground" />
                  <span className="text-xs font-bold text-accent-foreground">PRO</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* No Credits Banner */}
        {noCredits && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-destructive" />
              <span className="text-sm font-medium">No AI credits remaining</span>
            </div>
            <button onClick={() => navigate('/subscription')}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Messages */}
        <ClayCard className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-4">
                <Bot size={48} className="text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{t('askAnything')}</h3>
                <p className="text-sm text-muted-foreground mb-6">Powered by Google Gemini AI 🚀</p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {quickPrompts.map((prompt, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.95 }}
                      onClick={() => setInputText(prompt.text)}
                      className="clay-card p-3 text-left text-xs rounded-xl hover:bg-primary/5 transition-colors">
                      <span className="text-lg block mb-1">{prompt.emoji}</span>
                      <span className="text-muted-foreground">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                    {message.role === 'user' ? <User size={16} className="text-secondary-foreground" /> : <Bot size={16} className="text-primary-foreground" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user' ? 'clay-inset bg-secondary/30' : 'clay-card'}`}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none text-sm leading-relaxed"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.role === 'assistant' && (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => speakMessage(message.content)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                          <Volume2 size={12} className={isSpeaking ? 'text-primary' : 'text-muted-foreground'} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center"><Bot size={16} className="text-primary-foreground" /></div>
                <div className="clay-card p-3 rounded-2xl flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ClayCard>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="clay-card p-2 flex items-center gap-2">
            <motion.button onClick={toggleListening} whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'clay-inset text-primary'}`}>
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </motion.button>
            {/* --- REPLACE YOUR INPUT COMPONENT WITH THIS --- */}
    <Input value={inputText} onChange={(e) => setInputText(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      placeholder={noCredits ? t('upgradeToProCredits') : isListening ? t('listening') : t('askAnything')}
      disabled={!!noCredits}
      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm" 
    />
            <motion.button onClick={sendMessage} whileTap={{ scale: 0.95 }} disabled={!inputText.trim() || isLoading || !!noCredits}
              className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default AIChat;
