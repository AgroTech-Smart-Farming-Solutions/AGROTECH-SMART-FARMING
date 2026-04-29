import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Pill, Leaf, Shield, Crown, AlertTriangle, Volume2, VolumeX, ScanLine } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
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
  tomato: { en: 'Tomato', hi: 'टमाटर', pa: 'टमाटर', mr: 'टोमॅटो', ta: 'தக்காளி', te: 'టమోటా', bn: 'টমেটো', gu: 'ટામેટા' },
  rice: { en: 'Rice', hi: 'चावल', pa: 'चावल', mr: 'तांदूळ', ta: 'அரிसी', te: 'బియ్యం', bn: 'চাল', gu: 'ચોખા' },
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
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!GROQ_API_KEY) {
        throw new Error("Groq API key is missing. Please add VITE_GROQ_API_KEY to .env");
      }

      const promptText = `You are an expert agricultural AI doctor for Indian farmers. 
      Analyze this image. The user selected crop context is: ${selectedCrop}.
      Requested Language: ${language === 'hi' ? 'Hindi' : 'English'}.
      If the image is NOT a plant leaf (like a screenshot or random object), respond with disease: "Invalid Image".
      Respond ONLY with a valid JSON object containing these exact keys (do not include markdown tags like \`\`\`json):
      {
        "disease": "Name of the disease or 'Healthy'",
        "confidence": 95,
        "description": "Short explanation of the symptoms",
        "treatment": ["step 1", "step 2"],
        "severity": "low", 
        "prevention": "How to prevent this in future",
        "fertilizer": "Recommended fertilizer if applicable"
      }`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { 
                  type: "image_url", 
                  image_url: { url: selectedImage }
                }
              ]
            }
          ],
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Groq API Error: ${response.status}`);
      }

      const data = await response.json();
      let jsonText = data.choices?.[0]?.message?.content;
      
      if (!jsonText) throw new Error("Received empty response from AI");

      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

      const diagnosisResult = JSON.parse(jsonText);

      setDiagnosis(diagnosisResult);
      await deductCredit('disease');
      setCreditInfo(await checkCredits('disease'));

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
    low: 'text-primary bg-primary/10 border-primary/20',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-destructive bg-destructive/10 border-destructive/20',
  };

  const noCredits = creditInfo && !creditInfo.allowed && !creditInfo.isPremium;

  return (
    <AppLayout>
      {/* w-full aur overflow-x-hidden lagaya taaki mobile par horizontally kuch screen se bahar na jaaye */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto space-y-6 pb-24 px-2 sm:px-4 overflow-x-hidden box-border">
        
        {/* Header Component */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border shadow-md transition-all">
          <img src={leafScanImg} alt="Leaf scan" className="w-full h-36 sm:h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90" />
          <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
                  <Leaf className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">{t('drDisease')}</h1>
                  <p className="text-[10px] sm:text-sm text-muted-foreground font-medium flex items-center gap-1">
                    {getText('aiPowered')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 self-start sm:self-end">
                {creditInfo && !creditInfo.isPremium && (
                  <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-sm">
                    <Leaf size={12} className="text-primary sm:w-3.5 sm:h-3.5" />
                    <span className="text-[10px] sm:text-sm font-bold">{creditInfo.remaining}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{getText('perDay')}</span>
                  </div>
                )}
                {creditInfo?.isPremium && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 px-3 py-1.5 rounded-full border border-yellow-300 shadow-sm">
                    <Crown size={12} className="text-yellow-800 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[10px] sm:text-sm font-bold text-yellow-900">PRO</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Crop Selection Row */}
        {!diagnosis && !isScanning && !showWebcam && (
          <div className="w-full space-y-3">
            <p className="text-sm font-bold text-foreground/80 px-1">{getText('selectCrop')}</p>
            <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-3 scrollbar-hide snap-x px-1 w-full">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 snap-start ${
                    selectedCrop === crop.id 
                      ? 'bg-primary/10 text-primary border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]' 
                      : 'bg-card border-transparent shadow-sm hover:bg-muted hover:border-border'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{crop.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{crop.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Credits Banner - Made 100% responsive width */}
        {noCredits && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full p-4 rounded-xl sm:rounded-2xl bg-destructive/10 border-2 border-destructive/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm box-border">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="p-1.5 sm:p-2 bg-destructive/20 rounded-full shrink-0">
                <AlertTriangle size={16} className="text-destructive sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-destructive-foreground break-words">Daily scan limit reached</span>
            </div>
            <button onClick={() => navigate('/subscription')} className="w-full sm:w-auto text-xs sm:text-sm font-bold text-white bg-destructive px-4 py-2.5 rounded-lg sm:rounded-xl hover:bg-destructive/90 transition-colors shadow-md text-center">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Camera/Upload Area */}
        <ClayCard className="relative w-full p-4 sm:p-8 text-center overflow-hidden rounded-2xl sm:rounded-3xl box-border flex flex-col items-center">
          <input ref={uploadInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          
          {showWebcam ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 w-full">
              <div className="relative w-full max-w-sm aspect-[3/4] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-inner ring-2 sm:ring-4 ring-muted mx-auto">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none border-[2px] border-white/20 rounded-xl sm:rounded-2xl m-3 sm:m-4"></div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm mx-auto">
                <ClayButton onClick={stopCamera} variant="secondary" className="text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl w-full">Cancel</ClayButton>
                <ClayButton onClick={capturePhoto} variant="primary" className="text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl w-full">Capture</ClayButton>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          ) : !selectedImage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-4 sm:py-6 w-full max-w-sm mx-auto">
              <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl clay-inset flex items-center justify-center mb-4 sm:mb-5 bg-primary/5 shrink-0">
                <Camera className="text-primary opacity-80 w-8 h-8 sm:w-12 sm:h-12 drop-shadow-sm" />
              </motion.div>
              
              <h3 className="font-extrabold text-base sm:text-xl mb-1 sm:mb-2 text-foreground text-center w-full">{t('scanLeaf')}</h3>
              <p className="text-[11px] sm:text-sm text-muted-foreground mb-6 max-w-[280px] sm:max-w-xs leading-relaxed text-center break-words">
                {getText('takePhoto')}
              </p>
              
              <div className="flex flex-col w-full gap-3 sm:gap-4">
                <ClayButton onClick={startCamera} variant="primary" className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl group">
                  <Camera size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" /> {t('camera')}
                </ClayButton>
                
                <ClayButton onClick={() => uploadInputRef.current?.click()} variant="secondary" className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl group">
                  <Upload size={16} className="sm:w-[18px] sm:h-[18px] group-hover:-translate-y-1 transition-transform" /> {t('uploadImage')}
                </ClayButton>
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden flex flex-col items-center bg-muted/30 border shadow-inner">
              <img src={selectedImage} alt="Selected leaf" className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] object-contain rounded-xl sm:rounded-2xl" />
              
              {/* Futuristic Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 w-full h-full text-center">
                  <motion.div 
                    animate={{ y: ['-100%', '300%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]"
                  />
                  <ScanLine className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse mb-3 sm:mb-4" />
                  <span className="font-bold text-base sm:text-lg text-foreground mb-1">{t('scanning')}</span>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-3 py-1 sm:py-1.5 rounded-full w-fit mx-auto">
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin shrink-0" />
                    Groq Vision Engine...
                  </div>
                </div>
              )}
              
              {!isScanning && !diagnosis && !error && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 grid grid-cols-2 gap-2 sm:gap-4">
                  <ClayButton onClick={resetScan} variant="secondary" className="text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg">{t('retake')}</ClayButton>
                  <ClayButton onClick={handleScan} variant="primary" className="text-xs sm:text-sm font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-[0_4px_15px_rgba(var(--primary),0.4)]" disabled={!!noCredits}>{t('scanNow')}</ClayButton>
                </motion.div>
              )}
            </div>
          )}
        </ClayCard>

        {/* Error Card */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full box-border">
            <ClayCard className="w-full border-l-4 border-l-destructive border-t-0 border-r-0 border-b-0 p-4 sm:p-5 bg-destructive/5 box-border">
              <div className="flex items-start sm:items-center gap-3 mb-4">
                <div className="p-1.5 sm:p-2 bg-destructive/10 rounded-full shrink-0">
                  <AlertCircle className="text-destructive w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-xs sm:text-sm text-destructive font-bold break-words">{error}</p>
              </div>
              <ClayButton onClick={resetScan} variant="secondary" className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl">{t('scanAnother')}</ClayButton>
            </ClayCard>
          </motion.div>
        )}

        {/* Diagnosis Results */}
        <AnimatePresence>
          {diagnosis && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full space-y-4 sm:space-y-5 box-border">
              
              {/* Primary Diagnosis Card */}
              <ClayCard className="relative w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden box-border">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-bl-full -z-10" />
                
                <button onClick={toggleSpeech} className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-secondary text-primary hover:bg-primary/20 transition-colors shadow-sm z-10">
                  {isSpeaking ? <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 sm:mb-6 pr-10 sm:pr-0 gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center shrink-0 shadow-md">
                      <AlertCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5 sm:mb-1">{t('diagnosis')}</p>
                      <h3 className="font-extrabold text-lg sm:text-2xl text-foreground break-words leading-tight">{diagnosis.disease}</h3>
                    </div>
                  </div>
                  
                  {/* Confidence Score Bar */}
                  <div className="w-full sm:w-auto sm:text-right mt-2 sm:mt-0">
                    <div className="flex items-center justify-between sm:justify-end gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase order-2 sm:order-1">Match</span>
                      <span className="text-xl sm:text-3xl font-black text-primary order-1 sm:order-2">{diagnosis.confidence}%</span>
                    </div>
                    <div className="w-full sm:w-32 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${diagnosis.confidence}%` }} transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-primary rounded-full" 
                      />
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold mb-4 sm:mb-5 border ${severityColors[diagnosis.severity] || severityColors.low}`}>
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
                  {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                </div>
                <p className="text-xs sm:text-base text-muted-foreground leading-relaxed font-medium bg-muted/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl break-words">{diagnosis.description}</p>
              </ClayCard>

              {/* Treatment List */}
              {diagnosis.treatment?.length > 0 && (
                <ClayCard className="w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl box-border">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Pill className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-xl text-foreground">{t('treatment')}</h3>
                  </div>
                  <ul className="space-y-3 sm:space-y-4">
                    {diagnosis.treatment.map((step, index) => (
                      <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} 
                        className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-muted/50 transition-colors">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="text-primary w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed break-words">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {diagnosis.fertilizer && (
                    <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 mt-5 sm:mt-6">
                      <div className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 opacity-5 pointer-events-none">
                        <Leaf className="w-16 h-16 sm:w-24 sm:h-24" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 sm:mb-2 relative z-10">{getText('recFertilizer')}</p>
                      <p className="text-xs sm:text-sm font-bold text-foreground relative z-10 break-words">{diagnosis.fertilizer}</p>
                    </div>
                  )}
                </ClayCard>
              )}

              {/* Prevention */}
              {diagnosis.prevention && (
                <ClayCard className="w-full p-5 sm:p-8 rounded-2xl sm:rounded-3xl box-border">
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald/10 flex items-center justify-center shrink-0">
                      <Shield className="text-emerald w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="font-extrabold text-base sm:text-xl text-foreground">{getText('prevention')}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed sm:p-2 break-words">{diagnosis.prevention}</p>
                </ClayCard>
              )}
              
              <ClayButton onClick={resetScan} variant="secondary" className="w-full py-3 sm:py-4 text-xs sm:text-base font-extrabold shadow-md rounded-xl sm:rounded-2xl mt-2 sm:mt-4">
                {t('scanAnother')}
              </ClayButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default CropDoctor;