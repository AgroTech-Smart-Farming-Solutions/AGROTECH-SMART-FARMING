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
  aiPowered: { en: 'AI-Powered Disease Detection 🔬', hi: 'AI-संचालित रोग पहचान 🔬', pa: 'AI-ਸੰਚਾਲਿਤ ਬਿਮਾਰੀ ਖੋਜ 🔬', mr: 'AI-सक्षम रोग शोध 🔬', ta: 'AI-ஆதரவு நோய் கண்டறிதல் 🔬', te: 'AI-ஆధారిత వ్యాధి గుర్তিంపు 🔬', bn: 'এআই-চালিত রোগ সনাক্তকরণ 🔬', gu: 'AI-સંચાલિત રોગ શોધ 🔬' },
  perDay: { en: '/day', hi: '/दिन', pa: '/ਦਿਨ', mr: '/दिवस', ta: '/நாள்', te: '/రోజు', bn: '/দিন', gu: '/દિવસ' },
  selectCrop: { en: 'Select Crop', hi: 'फसल चुनें', pa: 'ਫ਼ਸਲ ਚੁਣੋ', mr: 'पीक निवडा', ta: 'பயிரைத் தேர்ந்தெடுக்கவும்', te: 'పంటను ఎంచుకోండి', bn: 'ফসল নির্বাচন করুন', gu: 'પાક પસંદ કરો' },
  takePhoto: { en: 'Take a photo or upload an image of the affected leaf', hi: 'प्रभावित पत्ती की तस्वीर लें या अपलोड करें', pa: 'ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੀ ਫੋਟੋ ਲਓ ਜਾਂ ਚਿੱਤਰ ਅਪਲੋਡ ਕਰੋ', mr: 'प्रभावित पानाचा फोटो घ्या किंवा प्रतिमा अपलोड करा', ta: 'பாதிக்கப்பட்ட இலையின் புகைப்படத்தை எடுக்கவும் அல்லது பதிவேற்றவும்', te: 'ప్రభావిత ఆకు ఫోటో తీయండి లేదా చిత્રાన్ని అప్‌లోడ్ చేయండి', bn: 'আক্রান্ত পাতার একটি ছবি নিন বা ছবি আপলোড করুন', gu: 'અસરગ્રસ્ત પાનનો ફોટો લો અથવા છબી અપલોડ કરો' },
  recFertilizer: { en: 'Recommended Fertilizer & Dosage', hi: 'अनुशंसित उर्वरक और खुराक', pa: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਖਾਦ ਅਤੇ ਖੁਰਾਕ', mr: 'शिफारस केलेले खत आणि डोस', ta: 'பரிந்துரைக்கப்பட்ட உரம் மற்றும் அளவு', te: 'సిఫార్సు చేయబడిన ఎరువులు & మోతాదు', bn: 'প্রস্তাবিত সার এবং ডোজ', gu: 'ભલામણ કરેલ ખાતર અને ડોઝ' },
  general: { en: 'General', hi: 'सामान्य', pa: 'ਆਮ', mr: 'सामान्य', ta: 'பொதுவானது', te: 'సాధారణ', bn: 'সাধারণ', gu: 'સામાન્ય' },
  wheat: { en: 'Wheat', hi: 'गेहूं', pa: 'ਕਣਕ', mr: 'गहू', ta: 'கோதுமை', te: 'గోধুమ', bn: 'গম', gu: 'ઘઉં' },
  tomato: { en: 'Tomato', hi: 'टमाटर', pa: 'ਟਮਾਟਰ', mr: 'टोमॅటో', ta: 'தக்காளி', te: 'టమోటా', bn: 'টমেটো', gu: 'ટામેટા' },
  rice: { en: 'Rice', hi: 'चावल', pa: 'चावल', mr: 'तांदूळ', ta: 'அரிசி', te: 'బియ్యம்', bn: 'চাল', gu: 'চোখা' },
  potato: { en: 'Potato', hi: 'आलू', pa: 'ਆਲੂ', mr: 'बटाटा', ta: 'உருளைக்கிழங்கு', te: 'బంగాళాదుంప', bn: 'আলু', gu: 'બટાકા' },
  cotton: { en: 'Cotton', hi: 'कपास', pa: 'ਕਪਾਹ', mr: 'कापूस', ta: 'பருத்தி', te: 'పత్తి', bn: 'তুলা', gu: 'કપાસ' },
};

const CropDoctor: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const getText = (key: keyof typeof localT) => localT[key][language as keyof typeof localT['aiPowered']] || localT[key].en;

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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-doctor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 
          },
          body: JSON.stringify({ imageBase64: selectedImage.split(',')[1], language, cropContext: selectedCrop }),
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
      {/* Container - Fixed width/max-width for responsiveness */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 w-full max-w-2xl mx-auto px-1 sm:px-4 pb-28">
        
        {/* Header - Fixed Flex wrapping and text wrapping for smaller screens */}
        <div className="relative rounded-2xl overflow-hidden w-full bg-card border shadow-sm">
          <img src={leafScanImg} alt="Leaf scan" className="w-full h-36 sm:h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald flex items-center justify-center shadow-lg shrink-0">
                  <Leaf className="text-emerald-foreground" size={20} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{t('drDisease')}</h1>
                  {/* AI text: Allow wrapping with break-words to prevent cut-off */}
                  <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{getText('aiPowered')}</p>
                </div>
              </div>
              
              <div className="flex gap-2 self-start sm:self-auto flex-wrap">
                {creditInfo && !creditInfo.isPremium && (
                  <div className="flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-full shrink-0 border border-border/50">
                    <Leaf size={12} className="text-primary" />
                    <span className="text-[10px] sm:text-xs font-bold">{creditInfo.remaining}</span>
                    <span className="text-[10px] text-muted-foreground">{getText('perDay')}</span>
                  </div>
                )}
                {creditInfo?.isPremium && (
                  <div className="flex items-center gap-1.5 bg-accent/80 backdrop-blur-sm px-3 py-1.5 rounded-full shrink-0 border border-border/50">
                    <Crown size={12} className="text-accent-foreground" />
                    <span className="text-[10px] sm:text-xs font-bold text-accent-foreground">PRO</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Crop Selection - Fixed horizontal overflow with proper scrolling row */}
        {!diagnosis && !isScanning && !showWebcam && (
          <div className="flex flex-col gap-2 w-full min-w-0">
            <p className="text-sm font-semibold px-1">{getText('selectCrop')}</p>
            {/* Parent container handles overflow x */}
            <div className="w-full overflow-x-auto scrollbar-hide -mx-1 px-1 pb-2">
              {/* Inner container uses full w-max width */}
              <div className="flex gap-2 w-max">
                {crops.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all ${
                      selectedCrop === crop.id ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border hover:bg-muted'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{crop.icon}</span>
                    <span className="text-xs sm:text-sm font-medium">{crop.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Credits Banner */}
        {noCredits && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <AlertTriangle size={16} className="text-destructive shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Daily scan limit reached</span>
            </div>
            <button onClick={() => navigate('/subscription')}
              className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors w-full sm:w-auto">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Camera/Upload Area */}
        <ClayCard className="relative overflow-hidden p-3 sm:p-6 w-full">
          <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          
          {showWebcam ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative w-full aspect-square sm:aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <ClayButton onClick={stopCamera} variant="secondary" className="w-full text-xs sm:text-sm">Cancel</ClayButton>
                <ClayButton onClick={capturePhoto} variant="primary" className="w-full text-xs sm:text-sm">Capture</ClayButton>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : !selectedImage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-6 sm:py-10 w-full px-2">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl clay-inset flex items-center justify-center mb-4 sm:mb-6">
                <Camera className="text-muted-foreground w-8 h-8 sm:w-12 sm:h-12" />
              </motion.div>
              <h3 className="font-bold text-base sm:text-lg mb-2">{t('scanLeaf')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 max-w-[250px] sm:max-w-xs leading-relaxed">{getText('takePhoto')}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mx-auto">
                <ClayButton onClick={startCamera} variant="primary" className="w-full flex items-center justify-center gap-2 py-3 text-xs sm:text-sm">
                  <Camera size={16} /> {t('camera')}
                </ClayButton>
                
                <ClayButton onClick={() => uploadInputRef.current?.click()} variant="secondary" className="w-full flex items-center justify-center gap-2 py-3 text-xs sm:text-sm">
                  <Upload size={16} /> {t('uploadImage')}
                </ClayButton>
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-black/5">
              <img src={selectedImage} alt="Selected leaf" className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] object-contain rounded-2xl" />
              {isScanning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
                  <motion.div className="absolute left-0 right-0 top-0 h-1 bg-primary"
                    animate={{ top: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} />
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin mb-3 sm:mb-4" />
                  <span className="font-semibold text-sm sm:text-lg text-center">{t('scanning')}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground text-center mt-1 sm:mt-2 px-2 sm:px-4 break-words">
                    Gemini AI analyzing {getText(selectedCrop.toLowerCase() as any)} leaf...
                  </span>
                </motion.div>
              )}
              {!isScanning && !diagnosis && !error && (
                <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 grid grid-cols-2 gap-2 sm:gap-3">
                  <ClayButton onClick={resetScan} variant="secondary" className="w-full shadow-md text-xs sm:text-sm py-2 sm:py-3">{t('retake')}</ClayButton>
                  <ClayButton onClick={handleScan} variant="primary" className="w-full shadow-md text-xs sm:text-sm py-2 sm:py-3" disabled={!!noCredits}>{t('scanNow')}</ClayButton>
                </div>
              )}
            </div>
          )}
        </ClayCard>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <ClayCard className="border-2 border-destructive/20 p-3 sm:p-4 w-full">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="text-destructive shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                <p className="text-xs sm:text-sm text-destructive font-medium break-words leading-snug">{error}</p>
              </div>
              <ClayButton onClick={resetScan} variant="secondary" className="w-full mt-3 sm:mt-4 py-2 sm:py-3 text-xs sm:text-sm">{t('scanAnother')}</ClayButton>
            </ClayCard>
          </motion.div>
        )}

        {/* Diagnosis Result - Text wrapping fixes */}
        <AnimatePresence>
          {diagnosis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-3 sm:gap-4 w-full">
              <ClayCard className="relative p-4 sm:p-5 w-full">
                <button onClick={toggleSpeech} className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <div className="flex items-start justify-between mb-4 pr-10 w-full flex-wrap gap-x-3 gap-y-1">
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0 pr-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-destructive/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="text-destructive w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 break-words flex-1">
                      <h3 className="font-bold text-sm sm:text-lg leading-tight break-words">{diagnosis.disease}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{t('diagnosis')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-2xl font-bold text-primary">{diagnosis.confidence}%</span>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t('confidence')}</p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4 ${severityColors[diagnosis.severity]}`}>
                  <AlertCircle size={10} className="sm:w-3 sm:h-3" />
                  {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{diagnosis.description}</p>
              </ClayCard>

              {/* Treatment */}
              {diagnosis.treatment?.length > 0 && (
                <ClayCard className="p-4 sm:p-5 w-full">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap gap-x-3 gap-y-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><Pill className="text-primary w-3 h-3 sm:w-4 sm:h-4" /></div>
                    <h3 className="font-bold text-sm sm:text-lg">{t('treatment')}</h3>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-2">
                    {diagnosis.treatment.map((step, index) => (
                      <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="text-primary w-2 h-2 sm:w-3 sm:h-3" />
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed break-words flex-1">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {diagnosis.fertilizer && (
                    <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/10 mt-4 sm:mt-6">
                      <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1 sm:mb-2">{getText('recFertilizer')}</p>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">{diagnosis.fertilizer}</p>
                    </div>
                  )}
                </ClayCard>
              )}

              {/* Prevention */}
              {diagnosis.prevention && (
                <ClayCard className="p-4 sm:p-5 w-full">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap gap-x-3 gap-y-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald/20 flex items-center justify-center shrink-0"><Shield className="text-emerald w-3 h-3 sm:w-4 sm:h-4" /></div>
                    <h3 className="font-bold text-sm sm:text-lg">{getText('prevention')}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{diagnosis.prevention}</p>
                </ClayCard>
              )}
              
              <ClayButton onClick={resetScan} variant="secondary" className="w-full py-3 sm:py-4 text-xs sm:text-sm font-bold mt-2 shadow-sm">{t('scanAnother')}</ClayButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default CropDoctor;