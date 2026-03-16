import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Pill, Leaf, Shield, Crown, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import leafScanImg from '@/assets/leaf-scan.jpg';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
  prevention?: string;
}

const CropDoctor: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<{ allowed: boolean; remaining: number; isPremium: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checkCredits, deductCredit } = useCredits();

  useEffect(() => {
    checkCredits('disease').then(setCreditInfo);
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { setSelectedImage(e.target?.result as string); setDiagnosis(null); setError(null); };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    // Check credits
    const credits = await checkCredits('disease');
    setCreditInfo(credits);
    if (!credits.allowed) {
      setError('No scan credits remaining today. Upgrade to Pro for unlimited scans!');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crop-doctor', {
        body: { imageBase64: selectedImage, language },
      });
      if (fnError) throw fnError;

      if (data?.diagnosis) {
        setDiagnosis(data.diagnosis);
        await deductCredit('disease');
        const updatedCredits = await checkCredits('disease');
        setCreditInfo(updatedCredits);
      } else {
        setError('Could not analyze the image. Please try again.');
      }
    } catch (err) {
      console.error('Crop doctor error:', err);
      setError('Failed to analyze. Please check your connection and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setSelectedImage(null); setDiagnosis(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const severityColors = {
    low: 'text-primary bg-primary/20',
    medium: 'text-accent-foreground bg-accent',
    high: 'text-destructive-foreground bg-destructive',
  };

  const noCredits = creditInfo && !creditInfo.allowed && !creditInfo.isPremium;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src={leafScanImg} alt="Leaf scan" className="w-full h-32 sm:h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald flex items-center justify-center shadow-lg">
                <Leaf className="text-emerald-foreground" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('drDisease')}</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Disease Detection 🔬</p>
              </div>
            </div>
            {creditInfo && !creditInfo.isPremium && (
              <div className="flex items-center gap-1.5 bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Leaf size={14} className="text-primary" />
                <span className="text-xs font-bold">{creditInfo.remaining}</span>
                <span className="text-[10px] text-muted-foreground">/day</span>
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

        {/* No Credits Banner */}
        {noCredits && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-destructive" />
              <span className="text-sm font-medium">Daily scan limit reached</span>
            </div>
            <button onClick={() => navigate('/subscription')}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
              Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Camera/Upload Area */}
        <ClayCard className="relative overflow-hidden">
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          {!selectedImage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square flex flex-col items-center justify-center text-center p-8">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 rounded-3xl clay-inset flex items-center justify-center mb-6">
                <Camera size={40} className="text-muted-foreground" />
              </motion.div>
              <h3 className="font-bold text-lg mb-2">{t('scanLeaf')}</h3>
              <p className="text-sm text-muted-foreground mb-6">{language === 'hi' ? 'प्रभावित पत्ती की तस्वीर लें या अपलोड करें' : 'Take a photo or upload an image of the affected leaf'}</p>
              <div className="flex gap-3">
                <ClayButton onClick={() => fileInputRef.current?.click()} variant="primary" className="flex items-center gap-2">
                  <Camera size={18} /> {language === 'hi' ? 'कैमरा' : 'Camera'}
                </ClayButton>
                <ClayButton onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex items-center gap-2">
                  <Upload size={18} /> {t('uploadImage')}
                </ClayButton>
              </div>
            </motion.div>
          ) : (
            <div className="relative">
              <img src={selectedImage} alt="Selected leaf" className="w-full aspect-square object-cover rounded-2xl" />
              {isScanning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden rounded-2xl">
                    <motion.div className="absolute left-0 right-0 h-1 bg-primary"
                      animate={{ top: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 size={48} className="text-primary animate-spin mb-4" />
                      <span className="font-semibold text-lg">{t('scanning')}</span>
                      <span className="text-sm text-muted-foreground">Gemini AI analyzing leaf pattern...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {!isScanning && !diagnosis && !error && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                  <ClayButton onClick={resetScan} variant="secondary" className="flex-1">{t('retake')}</ClayButton>
                  <ClayButton onClick={handleScan} variant="primary" className="flex-1" disabled={!!noCredits}>{t('scanNow')}</ClayButton>
                </div>
              )}
            </div>
          )}
        </ClayCard>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ClayCard className="border-2 border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-destructive" size={20} />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <ClayButton onClick={resetScan} variant="secondary" className="w-full mt-3">{t('scanAnother')}</ClayButton>
            </ClayCard>
          </motion.div>
        )}

        {/* Diagnosis Result */}
        <AnimatePresence>
          {diagnosis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <ClayCard>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
                      <AlertCircle className="text-destructive" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{diagnosis.disease}</h3>
                      <p className="text-sm text-muted-foreground">{t('diagnosis')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{diagnosis.confidence}%</span>
                    <p className="text-[10px] text-muted-foreground">{t('confidence')}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${severityColors[diagnosis.severity]}`}>
                  <AlertCircle size={12} />
                  {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.description}</p>
              </ClayCard>
              {diagnosis.treatment?.length > 0 && (
                <ClayCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Pill className="text-primary" size={20} /></div>
                    <h3 className="font-bold">{t('treatment')}</h3>
                  </div>
                  <ul className="space-y-3">
                    {diagnosis.treatment.map((step, index) => (
                      <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle size={14} className="text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                </ClayCard>
              )}
              {diagnosis.prevention && (
                <ClayCard>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald/20 flex items-center justify-center"><Shield className="text-emerald" size={20} /></div>
                    <h3 className="font-bold">{language === 'hi' ? 'रोकथाम' : 'Prevention'}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.prevention}</p>
                </ClayCard>
              )}
              <ClayButton onClick={resetScan} variant="secondary" className="w-full">{t('scanAnother')}</ClayButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default CropDoctor;
