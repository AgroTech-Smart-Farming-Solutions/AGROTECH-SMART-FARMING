import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Check, Sprout, MapPin, Ruler, Wheat, ChevronRight, Loader2, AtSign, Globe, Camera } from 'lucide-react';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';

type Step = 'email' | 'otp' | 'questions';

interface OnboardingAnswers {
  name: string;
  username: string;
  location: string;
  farmSize: string;
  crops: string[];
  experience: string;
}

const cropOptions = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Cotton', 'Sugarcane', 'Potato', 'Soybean'];
const farmSizes = ['< 1 Acre', '1-5 Acres', '5-10 Acres', '10-25 Acres', '25+ Acres'];
const experienceLevels = ['Beginner (0-2 years)', 'Intermediate (3-7 years)', 'Experienced (8-15 years)', 'Expert (15+ years)'];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithOtp, verifyOtp, signUp, login, updateProfile, uploadAvatar, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionStep, setQuestionStep] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: '', username: '', location: '', farmSize: '', crops: [], experience: '',
  });

  const languages = [
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
    { code: 'hi' as const, label: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr' as const, label: 'मराठी', flag: '🇮🇳' },
    { code: 'pa' as const, label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'ta' as const, label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te' as const, label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn' as const, label: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu' as const, label: 'ગુજરાતી', flag: '🇮🇳' },
  ];

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const DEMO_MODE = true;
  const DEMO_OTP = '123456';

  const handleSendOTP = async () => {
    if (!email.includes('@') || !email.includes('.')) return;
    setLoading(true);
    setError('');
    if (DEMO_MODE) {
      setTimeout(() => { setLoading(false); setStep('otp'); }, 800);
      return;
    }
    const { error } = await signInWithOtp(email);
    setLoading(false);
    if (error) setError(error.message);
    else setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    if (DEMO_MODE) {
      if (otp === DEMO_OTP) {
        const demoPassword = 'DemoPass123!';
        const { error: signUpErr } = await signUp(email, demoPassword);
        if (signUpErr && signUpErr.message?.includes('already registered')) {
          const { error: loginErr } = await login(email, demoPassword);
          if (loginErr) { setLoading(false); setError('Login failed. Try a different email.'); return; }
        } else if (signUpErr) { setLoading(false); setError(signUpErr.message); return; }
        setLoading(false);
        setStep('questions');
      } else { setLoading(false); setError('Invalid OTP. Use 123456 for demo.'); }
      return;
    }
    const { error } = await verifyOtp(email, otp);
    setLoading(false);
    if (error) setError(error.message);
    else setStep('questions');
  };

  const checkUsername = async (username: string) => {
    if (username.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
    setUsernameAvailable(!data);
    setCheckingUsername(false);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    if (avatarFile) await uploadAvatar(avatarFile);
    await updateProfile({
      name: answers.name,
      username: answers.username,
      location: answers.location,
      farm_size: answers.farmSize,
      primary_crops: answers.crops,
      experience: answers.experience,
    });
    setLoading(false);
    navigate('/');
  };

  const toggleCrop = (crop: string) => {
    setAnswers(prev => ({
      ...prev,
      crops: prev.crops.includes(crop) ? prev.crops.filter(c => c !== crop) : [...prev.crops, crop],
    }));
  };

  // 0=language, 1=name+avatar, 2=username, 3=location, 4=farmSize, 5=crops, 6=experience
  const canProceedQuestion = () => {
    switch (questionStep) {
      case 0: return true;
      case 1: return answers.name.trim().length >= 2;
      case 2: return answers.username.trim().length >= 3 && usernameAvailable === true;
      case 3: return answers.location.trim().length >= 2;
      case 4: return answers.farmSize !== '';
      case 5: return answers.crops.length > 0;
      case 6: return answers.experience !== '';
      default: return false;
    }
  };

  const totalSteps = 7;
  const nextQuestion = () => {
    if (questionStep < totalSteps - 1) setQuestionStep(questionStep + 1);
    else handleFinishOnboarding();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-8">
          <motion.div whileHover={{ rotate: 15 }} className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl overflow-hidden" style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)' }}>
            <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">AgroTech</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('smartFarming')}</p>
        </motion.div>

        {/* Language Selection on email step */}
        {step === 'email' && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {languages.slice(0, 4).map((lang) => (
              <motion.button key={lang.code} onClick={() => setLanguage(lang.code)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${language === lang.code ? 'bg-primary/15 text-primary border border-primary/30' : 'clay-card text-muted-foreground'}`}>
                {lang.flag} {lang.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Progress indicator */}
        {step === 'questions' && (
          <div className="flex gap-1.5 mb-6 px-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= questionStep ? 'bg-primary' : 'bg-muted'}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05 }} />
            ))}
          </div>
        )}

        {/* Auth Card */}
        <ClayCard className="p-6">
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold text-center mb-6">{t('login')}</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">{t('enterEmail')}</p>
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-xl">{error}</p>}
                <div className="clay-inset p-1 rounded-2xl">
                  <Input type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="border-0 bg-transparent text-lg text-center py-6 focus-visible:ring-0" />
                </div>
                <ClayButton onClick={handleSendOTP} variant="primary" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                  {loading ? t('sending') : t('sendOTP')}
                  {!loading && <ArrowRight size={18} />}
                </ClayButton>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold text-center mb-2">{t('verifyOTP')}</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">{t('codeSentTo')} <span className="font-semibold text-foreground">{email}</span></p>
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-xl">{error}</p>}
                <div className="clay-inset p-1 rounded-2xl">
                  <Input type="text" placeholder="● ● ● ● ● ●" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="border-0 bg-transparent text-2xl text-center tracking-[0.5em] py-6 focus-visible:ring-0" maxLength={6} />
                </div>
                <ClayButton onClick={handleVerifyOTP} variant="primary" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {loading ? t('verifying') : t('verifyOTP')}
                </ClayButton>
                <button onClick={() => { setStep('email'); setError(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">{t('changeEmail')}</button>
              </motion.div>
            )}

            {step === 'questions' && (
              <motion.div key={`q-${questionStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {/* Step 0: Language */}
                {questionStep === 0 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><Globe size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('selectLanguage')}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map(lang => (
                        <motion.button key={lang.code} whileTap={{ scale: 0.95 }} onClick={() => setLanguage(lang.code)}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${language === lang.code ? 'bg-primary/15 text-primary border-2 border-primary/30' : 'clay-card text-muted-foreground'}`}>
                          {lang.flag} {lang.label}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 1: Name + Avatar */}
                {questionStep === 1 && (
                  <>
                    <div className="text-center">
                      <div className="relative mx-auto mb-3 w-20 h-20">
                        <label className="cursor-pointer block w-full h-full rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <Camera size={28} className="text-primary" />
                          )}
                          <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                        </label>
                      </div>
                      <h2 className="text-lg font-bold">{t('whatsYourName')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('letsKnowYou')}</p>
                    </div>
                    <div className="clay-inset p-1 rounded-2xl">
                      <Input type="text" placeholder={t('whatsYourName')} value={answers.name} onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                        className="border-0 bg-transparent text-center py-5 focus-visible:ring-0" autoFocus />
                    </div>
                  </>
                )}

                {/* Step 2: Username */}
                {questionStep === 2 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><AtSign size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('chooseUsername')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('yourIdentity')}</p>
                    </div>
                    <div className="clay-inset p-1 rounded-2xl relative">
                      <Input type="text" placeholder="@farmer_raj" value={answers.username}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                          setAnswers(prev => ({ ...prev, username: val }));
                          checkUsername(val);
                        }}
                        className="border-0 bg-transparent text-center py-5 focus-visible:ring-0" autoFocus />
                    </div>
                    {answers.username.length >= 3 && (
                      <p className={`text-xs text-center font-medium ${checkingUsername ? 'text-muted-foreground' : usernameAvailable ? 'text-primary' : 'text-destructive'}`}>
                        {checkingUsername ? '...' : usernameAvailable ? `@${answers.username} is available ✓` : `@${answers.username} is taken ✗`}
                      </p>
                    )}
                  </>
                )}

                {/* Step 3: Location */}
                {questionStep === 3 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><MapPin size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('whereIsYourFarm')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('cityDistrictState')}</p>
                    </div>
                    <div className="clay-inset p-1 rounded-2xl">
                      <Input type="text" placeholder="e.g. Nashik, Maharashtra" value={answers.location} onChange={(e) => setAnswers(prev => ({ ...prev, location: e.target.value }))}
                        className="border-0 bg-transparent text-center py-5 focus-visible:ring-0" autoFocus />
                    </div>
                  </>
                )}

                {/* Step 4: Farm size */}
                {questionStep === 4 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><Ruler size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('howBigFarm')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('selectSize')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {farmSizes.map(size => (
                        <motion.button key={size} whileTap={{ scale: 0.95 }} onClick={() => setAnswers(prev => ({ ...prev, farmSize: size }))}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${answers.farmSize === size ? 'bg-primary/15 text-primary border-2 border-primary/30' : 'clay-card text-muted-foreground'}`}>
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 5: Crops */}
                {questionStep === 5 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><Wheat size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('whatDoYouGrow')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('selectCrops')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {cropOptions.map(crop => (
                        <motion.button key={crop} whileTap={{ scale: 0.95 }} onClick={() => toggleCrop(crop)}
                          className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${answers.crops.includes(crop) ? 'bg-primary/15 text-primary border-2 border-primary/30' : 'clay-card text-muted-foreground'}`}>
                          🌾 {crop}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 6: Experience */}
                {questionStep === 6 && (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 mx-auto mb-3 flex items-center justify-center"><Sprout size={28} className="text-primary" /></div>
                      <h2 className="text-lg font-bold">{t('yourExperience')}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{t('helpPersonalize')}</p>
                    </div>
                    <div className="space-y-2">
                      {experienceLevels.map(level => (
                        <motion.button key={level} whileTap={{ scale: 0.98 }} onClick={() => setAnswers(prev => ({ ...prev, experience: level }))}
                          className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-all text-left ${answers.experience === level ? 'bg-primary/15 text-primary border-2 border-primary/30' : 'clay-card text-muted-foreground'}`}>
                          {level}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                <ClayButton onClick={nextQuestion} variant="primary"
                  className={`w-full flex items-center justify-center gap-2 transition-opacity ${canProceedQuestion() ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
                  disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {questionStep === totalSteps - 1 ? (loading ? t('creating') : t('createAccount')) : t('continueBtn')}
                  {!loading && <ChevronRight size={18} />}
                </ClayButton>
                {questionStep > 0 && (
                  <button onClick={() => setQuestionStep(questionStep - 1)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">{t('back')}</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ClayCard>

        <p className="text-center text-xs text-muted-foreground mt-6">{t('termsAgreement')}</p>
      </motion.div>
    </div>
  );
};

export default Login;
