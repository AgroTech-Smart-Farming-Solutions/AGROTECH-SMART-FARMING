import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Pill, Leaf, Shield, Crown, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import leafScanImg from '@/assets/leaf-scan.jpg';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
  prevention?: string;
  fertilizer?: string; 
}

const localT = {
  aiPowered: { en: 'AI-Powered Disease Detection 🔬', hi: 'AI-संचालित रोग पहचान 🔬', pa: 'AI-ਸੰਚਾਲਿਤ ਬਿਮਾਰੀ ਖੋਜ 🔬', mr: 'AI-सक्षम रोग शोध 🔬', ta: 'AI-ஆதரவு நோய் கண்டறிதல் 🔬', te: 'AI-ఆధారిత వ్యాధి గుర్তিంపు 🔬', bn: 'এআই-চালিত রোগ সনাক্তকরণ 🔬', gu: 'AI-સંચાલિત રોગ શોધ 🔬' },
  perDay: { en: '/day', hi: '/दिन', pa: '/ਦਿਨ', mr: '/दिवस', ta: '/நாள்', te: '/రోజు', bn: '/दिन', gu: '/દિવસ' },
  selectCrop: { en: 'Select Crop', hi: 'फसल चुनें', pa: 'ਫ਼ਸਲ ਚੁਣੋ', mr: 'पीक निवडा', ta: 'பயிரைத் தேர்ந்தெடுக்கவும்', te: 'పంటను ఎంచుకోండి', bn: 'ফসল নির্বাচন করুন', gu: 'પાક પસંદ કરો' },
  takePhoto: { en: 'Take a photo or upload an image of the affected leaf', hi: 'प्रभावित पत्ती की तस्वीर लें या अपलोड करें', pa: 'ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੀ ਫੋਟੋ ਲਓ ਜਾਂ ਚਿੱਤਰ ਅਪਲੋਡ ਕਰੋ', mr: 'प्रभावित पानाचा फोटो घ्या किंवा प्रतिमा अपलोड करा', ta: 'பாதிக்கப்பட்ட இலையின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்', te: 'ప్రభావిత ఆకు ఫోటో తీయండి లేదా చిత્રાన్ని అప్‌లోడ్ చేయండి', bn: 'আক্রান্ত পাতার একটি ছবি নিন বা ছবি আপলোড করুন', gu: 'અસરગ્રસ્ત પાનનો ફોટો લો અથવા છબી અપલોડ કરો' },
  recFertilizer: { en: 'Recommended Fertilizer & Dosage', hi: 'अनुशंसित उर्वरक और खुराक', pa: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਖਾਦ ਅਤੇ ਖੁਰਾਕ', mr: 'शिफारस केलेले खत आणि डोस', ta: 'பரிந்துரைக்கப்பட்ட உரம் மற்றும் அளவு', te: 'సిఫార్సు చేయబడిన ఎరువులు & మోతాదు', bn: 'প্রস্তাবিত সার এবং ডোজ', gu: 'ભલામણ કરેલ ખાતર અને ડોઝ' },
  prevention: { en: 'Prevention', hi: 'रोकथाम', pa: 'ਰੋਕਥਾਮ', mr: 'प्रतिबंध', ta: 'தடுப்பு', te: 'నివారణ', bn: 'প্রতিরোধ', gu: 'અટકાવ' },
  general: { en: 'General', hi: 'सामान्य', pa: 'ਆਮ', mr: 'सामान्य', ta: 'பொதுவானது', te: 'సాధారణ', bn: 'সাধারণ', gu: 'સામાન્ય' },
  wheat: { en: 'Wheat', hi: 'गेहूं', pa: 'ਕਣਕ', mr: 'गहू', ta: 'கோதுமை', te: 'గోధుమ', bn: 'গম', gu: 'ઘਉਂ' },
  tomato: { en: 'Tomato', hi: 'टमाटर', pa: 'ਟਮਾਟਰ', mr: 'टोमॅటో', ta: 'தக்காளி', te: 'టమోటా', bn: 'টমেটো', gu: 'ટામેટા' },
  rice: { en: 'Rice', hi: 'चावल', pa: 'चावल', mr: 'तांदूळ', ta: 'அரிसी', te: 'బియ్యం', bn: 'চাল', gu: 'চোখা' },
  potato: { en: 'Potato', hi: 'आलू', pa: 'ਆਲੂ', mr: 'बटाटा', ta: 'உருளைக்கிழங்கு', te: 'బంగాళాదుంప', bn: 'আলু', gu: 'બટાકા' },
  cotton: { en: 'Cotton', hi: 'कपास', pa: 'ਕਪਾਹ', mr: 'कापूस', ta: 'பருத்தி', te: 'పత్తి', bn: 'তুলা', gu: 'કપાસ' },
};

const CropDoctor: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const getText = (key: string) => {
    const entry = localT[key as keyof typeof localT];
    if (!entry) return key;
    return entry[language as keyof typeof entry] || entry.en;
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<{ allowed: boolean; remaining: number; isPremium: boolean } | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('General'); 
  const [isSpeaking, setIsSpeaking] = useState(false); 
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { checkCredits, deductCredit } = useCredits();

  const crops = [
    { id: 'General', label: getText('general'), icon: '🌿' },
    { id: 'Wheat', label: getText('wheat'), icon: '🌾' },
    { id: 'Tomato', label: getText('tomato'), icon: '🍅' },
    { id: 'Rice', label: getText('rice'), icon: '🍚' },
    { id: 'Potato', label: getText('potato'), icon: '🥔' },
    { id: 'Cotton', label: getText('cotton'), icon: '☁️' },
  ];

  useEffect(() => {
    checkCredits('disease').then(setCreditInfo);
    return () => {
      window.speechSynthesis.cancel(); 
      if (stream) stream.getTracks().forEach(t => t.stop()); 
    };
  }, [stream]);

  useEffect(() => {
    if (showWebcam && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [showWebcam, stream]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { 
        setSelectedImage(e.target?.result as string); 
        setDiagnosis(null); 
        setError(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setShowWebcam(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      toast.error("Camera permissions denied. Please use the Upload Image button.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImage(imageData);
        setDiagnosis(null);
        setError(null);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setShowWebcam(false);
    setStream(null);
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    const credits = await checkCredits('disease');
    setCreditInfo(credits);
    if (!credits.allowed) {
      setError('No scan credits remaining today. Upgrade to Pro for unlimited scans!');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-doctor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 
          },
          body: JSON.stringify({ imageBase64: selectedImage.split(',')[1], language: language.toLowerCase(), cropContext: selectedCrop }),
        }
      );

      if (!response.ok) throw new Error(await response.json().then(d => d.error) || `Server Error`);
      const data = await response.json();

      if (data?.diagnosis) {
        setDiagnosis(data.diagnosis);
        await deductCredit('disease');
        setCreditInfo(await checkCredits('disease'));
      } else {
        setError('Could not analyze the image. Please try again.');
      }
    } catch (err: any) {
      console.error('Crop doctor error:', err);
      setError(err.message || 'Failed to analyze. Please check your connection.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!diagnosis) return;

    const text = `${diagnosis.disease}. ${diagnosis.description}. ${t('treatment')}: ${diagnosis.treatment.join(', ')}. ${diagnosis.fertilizer ? diagnosis.fertilizer : ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const resetScan = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSelectedImage(null); 
    setDiagnosis(null); 
    setError(null);
    stopCamera();
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const severityColors = {
    low: 'text-primary bg-primary/20',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-destructive-foreground bg-destructive',
  };

  const noCredits = creditInfo && !creditInfo.allowed && !creditInfo.isPremium;

  return (
    <AppLayout>
      {/* Exactly matching GovtSchemes layout wrapper */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24">
        
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden bg-card border shadow-sm">
          <img src={leafScanImg} alt="Leaf scan" className="w-full h-36 sm:h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald flex items-center justify-center shadow-lg shrink-0">
                  <Leaf className="text-emerald-foreground" size={20} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{t('drDisease')}</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{getText('aiPowered')}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {creditInfo && !creditInfo.isPremium && (
                  <div className="flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                    <Leaf size={12} className="text-primary" />
                    <span className="text-[10px] sm:text-xs font-bold">{creditInfo.remaining}</span>
                    <span className="text-[10px] text-muted-foreground">{getText('perDay')}</span>
                  </div>
                )}
                {creditInfo?.isPremium && (
                  <div className="flex items-center gap-1.5 bg-accent/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                    <Crown size={12} className="text-accent-foreground" />
                    <span className="text-[10px] sm:text-xs font-bold text-accent-foreground">PRO</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Crop Selection Row */}
        {!diagnosis && !isScanning && !showWebcam && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">{getText('selectCrop')}</p>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all snap-start ${
                    selectedCrop === crop.id 
                      ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{crop.icon}</span>
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{crop.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Credits Banner */}
        {noCredits && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-destructive shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Daily scan limit reached</span>
            </div>
            <button onClick={() => navigate('/subscription')} className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors shrink-0">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Camera/Upload Area */}
        <ClayCard className="relative p-4 sm:p-6 text-center">
          <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          
          {showWebcam ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full aspect-square sm:aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <ClayButton onClick={stopCamera} variant="secondary" className="text-xs sm:text-sm">Cancel</ClayButton>
                <ClayButton onClick={capturePhoto} variant="primary" className="text-xs sm:text-sm">Capture</ClayButton>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : !selectedImage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-4">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl clay-inset flex items-center justify-center mb-4">
                <Camera className="text-muted-foreground w-8 h-8 sm:w-10 sm:h-10" />
              </motion.div>
              
              <h3 className="font-bold text-base sm:text-lg mb-1">{t('scanLeaf')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-[250px] leading-relaxed break-words">
                {getText('takePhoto')}
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <ClayButton onClick={startCamera} variant="primary" className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm">
                  <Camera size={16} /> {t('camera')}
                </ClayButton>
                
                <ClayButton onClick={() => uploadInputRef.current?.click()} variant="secondary" className="flex items-center justify-center gap-2 py-3 text-xs sm:text-sm">
                  <Upload size={16} /> {t('uploadImage')}
                </ClayButton>
              </div>
            </motion.div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden flex flex-col items-center bg-black/5">
              <img src={selectedImage} alt="Selected leaf" className="w-full h-auto max-h-[40vh] object-contain rounded-2xl" />
              {isScanning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <span className="font-semibold text-sm">{t('scanning')}</span>
                  <span className="text-xs text-muted-foreground mt-1">Gemini AI analyzing...</span>
                </motion.div>
              )}
              {!isScanning && !diagnosis && !error && (
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                  <ClayButton onClick={resetScan} variant="secondary" className="text-xs">{t('retake')}</ClayButton>
                  <ClayButton onClick={handleScan} variant="primary" className="text-xs" disabled={!!noCredits}>{t('scanNow')}</ClayButton>
                </div>
              )}
            </div>
          )}
        </ClayCard>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ClayCard className="border-2 border-destructive/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="text-destructive shrink-0" size={18} />
                <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
              </div>
              <ClayButton onClick={resetScan} variant="secondary" className="w-full py-2 text-xs">{t('scanAnother')}</ClayButton>
            </ClayCard>
          </motion.div>
        )}

        {/* Diagnosis Results */}
        <AnimatePresence>
          {diagnosis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <ClayCard className="relative p-5">
                <button onClick={toggleSpeech} className="absolute top-4 right-4 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <div className="flex items-start justify-between mb-4 pr-10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="text-destructive w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">{diagnosis.disease}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t('diagnosis')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-primary">{diagnosis.confidence}%</span>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold mb-4 ${severityColors[diagnosis.severity]}`}>
                  <AlertCircle size={12} />
                  {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{diagnosis.description}</p>
              </ClayCard>

              {/* Treatment */}
              {diagnosis.treatment?.length > 0 && (
                <ClayCard className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Pill className="text-primary w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg">{t('treatment')}</h3>
                  </div>
                  <ul className="space-y-3">
                    {diagnosis.treatment.map((step, index) => (
                      <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="text-primary w-3 h-3" />
                        </div>
                        <span className="text-xs sm:text-sm">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {diagnosis.fertilizer && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mt-5">
                      <p className="text-[10px] sm:text-xs font-bold text-primary uppercase mb-2">{getText('recFertilizer')}</p>
                      <p className="text-xs sm:text-sm">{diagnosis.fertilizer}</p>
                    </div>
                  )}
                </ClayCard>
              )}

              {/* Prevention */}
              {diagnosis.prevention && (
                <ClayCard className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald/20 flex items-center justify-center">
                      <Shield className="text-emerald w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg">{getText('prevention')}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{diagnosis.prevention}</p>
                </ClayCard>
              )}
              
              <ClayButton onClick={resetScan} variant="secondary" className="w-full py-3 text-xs sm:text-sm font-bold shadow-sm">{t('scanAnother')}</ClayButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default CropDoctor;