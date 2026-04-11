import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Sprout, MapPin, Ruler, Wheat, ChevronRight, Loader2, AtSign, Globe, Camera, Lock } from 'lucide-react';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';

type Step = 'auth' | 'questions';

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
  const { login, signUp, signInWithGoogle, updateProfile, uploadAvatar, isAuthenticated, profile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [step, setStep] = useState<Step>('auth');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  ];

  // Redirect if already fully logged in with a profile
  React.useEffect(() => {
    if (isAuthenticated && profile?.username && step === 'auth') {
      navigate('/');
    }
  }, [isAuthenticated, profile, navigate, step]);

  const handleEmailAuth = async () => {
    if (!email || password.length < 6) {
      setError('Enter a valid email and at least 6 characters password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    if (isLoginMode) {
      const { error } = await login(email, password);
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        navigate('/'); // Login successful
      }
    } else {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setStep('questions'); // Move to onboarding after signup
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    setLoading(false);
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
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-8">
          <motion.div whileHover={{ rotate: 15 }} className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl overflow-hidden" style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.3)' }}>
            <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">AgroTech</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('smartFarming')}</p>
        </motion.div>

        {step === 'auth' && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {languages.map((lang) => (
              <motion.button key={lang.code} onClick={() => setLanguage(lang.code)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${language === lang.code ? 'bg-primary/15 text-primary border border-primary/30' : 'clay-card text-muted-foreground'}`}>
                {lang.flag} {lang.label}
              </motion.button>
            ))}
          </div>
        )}

        <ClayCard className="p-6">
          <AnimatePresence mode="wait">
            {step === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-bold text-center mb-2">
                  {isLoginMode ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {isLoginMode ? 'Enter your credentials to login' : 'Sign up to start smart farming'}
                </p>
                
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-xl">{error}</p>}
                
                <div className="space-y-3">
                  <div className="clay-inset p-1 rounded-2xl flex items-center px-4">
                    <Mail size={18} className="text-muted-foreground" />
                    <Input type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="border-0 bg-transparent text-base py-5 focus-visible:ring-0" />
                  </div>

                  <div className="clay-inset p-1 rounded-2xl flex items-center px-4 mb-2">
                    <Lock size={18} className="text-muted-foreground" />
                    <Input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="border-0 bg-transparent text-base py-5 focus-visible:ring-0" />
                  </div>
                </div>
                
                <ClayButton onClick={handleEmailAuth} variant="primary" className="w-full flex items-center justify-center gap-2 mb-2" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isLoginMode ? 'Login' : 'Sign Up'}
                  {!loading && <ArrowRight size={18} />}
                </ClayButton>

                <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="w-full text-sm text-primary hover:underline transition-all mb-2">
                  {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs">OR</span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>

                <ClayButton onClick={handleGoogleLogin} variant="secondary" className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-50 border border-gray-200" disabled={loading}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </ClayButton>
              </motion.div>
            )}

            {/* Questions Step remains identical */}
            {step === 'questions' && (
              <motion.div key={`q-${questionStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {/* ... (Keep all your existing questionStep 0 to 6 code here, nothing changes) ... */}
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