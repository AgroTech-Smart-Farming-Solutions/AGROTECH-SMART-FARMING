import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { Calendar, AlertTriangle, BookOpen, FileText, Plus, Trash2, Loader2, Download, RefreshCw, WifiOff } from 'lucide-react';
=======
import { Calendar, AlertTriangle, BookOpen, FileText, Plus, Trash2, Loader2, Download } from 'lucide-react';
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard, ClayButton } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock Data
const cropCalendarData = {
  wheat: {
    crop: 'Wheat',
    stages: [
      { name: 'Sowing', date: 'Nov 1-15', icon: '🌱' },
      { name: 'Germination', date: 'Nov 15-25', icon: '🌿' },
      { name: 'Tillering', date: 'Dec 1-30', icon: '🪴' },
      { name: 'Heading', date: 'Feb 1-28', icon: '🌾' },
      { name: 'Harvest', date: 'Apr 1-15', icon: '🌾' },
    ],
  },
  tomato: {
    crop: 'Tomato',
    stages: [
      { name: 'Nursery', date: 'Sep 1-15', icon: '🌱' },
      { name: 'Transplant', date: 'Oct 1-15', icon: '🪴' },
      { name: 'Flowering', date: 'Nov 1-15', icon: '🌸' },
      { name: 'Fruiting', date: 'Dec 1-31', icon: '🍅' },
      { name: 'Harvest', date: 'Jan-Mar', icon: '🧺' },
    ],
  },
};

<<<<<<< HEAD
interface Scheme {
  name: string;
  description: string;
  eligibility: string;
  deadline: string;
  link?: string;
}
=======
const govtSchemes = [
  {
    name: 'PM-KISAN',
    description: '₹6,000/year direct benefit transfer',
    eligibility: 'All landholding farmers',
    deadline: 'Ongoing',
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance at 2% premium',
    eligibility: 'Farmers growing notified crops',
    deadline: 'Before sowing',
  },
  {
    name: 'Kisan Credit Card',
    description: 'Credit at 4% interest rate',
    eligibility: 'All farmers, share croppers, tenant farmers',
    deadline: 'Ongoing',
  },
  {
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and fertilizer recommendations',
    eligibility: 'All farmers',
    deadline: 'Ongoing',
  },
];
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

// ─── Translations ────────────────────────────────────────────────────────────
const weatherTranslations: Record<string, {
  currentWeather: string;
  yourLocation: string;
  dangerAlert: string;
  weatherWarning: string;
  goodConditions: string;
  farmingAdvice: string;
  nextDays: string;
}> = {
  en: { currentWeather: 'Current Weather', yourLocation: 'Your Location', dangerAlert: 'Danger Alert', weatherWarning: 'Weather Warning', goodConditions: 'Good Conditions', farmingAdvice: 'Farming Advice Today', nextDays: 'Next 3 days' },
  hi: { currentWeather: 'वर्तमान मौसम', yourLocation: 'आपका स्थान', dangerAlert: 'खतरे की चेतावनी', weatherWarning: 'मौसम की चेतावनी', goodConditions: 'अच्छी स्थिति', farmingAdvice: 'आज के लिए कृषि सलाह', nextDays: 'अगले 3 दिन' },
  mr: { currentWeather: 'सध्याचे हवामान', yourLocation: 'तुमचे ठिकाण', dangerAlert: 'धोक्याचा इशारा', weatherWarning: 'हवामान इशारा', goodConditions: 'चांगली परिस्थिती', farmingAdvice: 'आजचा शेती सल्ला', nextDays: 'पुढील 3 दिवस' },
  pa: { currentWeather: 'ਮੌਜੂਦਾ ਮੌਸਮ', yourLocation: 'ਤੁਹਾਡੀ ਜਗ੍ਹਾ', dangerAlert: 'ਖਤਰੇ ਦੀ ਚੇਤਾਵਨੀ', weatherWarning: 'ਮੌਸਮ ਚੇਤਾਵਨੀ', goodConditions: 'ਚੰਗੀਆਂ ਸਥਿਤੀਆਂ', farmingAdvice: 'ਅੱਜ ਦੀ ਖੇਤੀਬਾੜੀ ਸਲਾਹ', nextDays: 'ਅਗਲੇ 3 ਦਿਨ' },
  ta: { currentWeather: 'தற்போதைய வானிலை', yourLocation: 'உங்கள் இடம்', dangerAlert: 'ஆபத்து எச்சரிக்கை', weatherWarning: 'வானிலை எச்சரிக்கை', goodConditions: 'நல்ல நிலைமைகள்', farmingAdvice: 'இன்றைய விவசாய ஆலோசனை', nextDays: 'அடுத்த 3 நாட்கள்' },
  te: { currentWeather: 'ప్రస్తుత వాతావరణం', yourLocation: 'మీ స్థానం', dangerAlert: 'ప్రమాద హెచ్చరిక', weatherWarning: 'వాతావరణ హెచ్చరిక', goodConditions: 'మంచి పరిస్థితులు', farmingAdvice: 'ఈరోజు వ్యవసాయ సలహా', nextDays: 'తదుపరి 3 రోజులు' },
  bn: { currentWeather: 'বর্তমান আবহাওয়া', yourLocation: 'আপনার অবস্থান', dangerAlert: 'বিপদ সতর্কতা', weatherWarning: 'আবহাওয়া সতর্কতা', goodConditions: 'ভালো পরিস্থিতি', farmingAdvice: 'আজকের কৃষি পরামর্শ', nextDays: 'পরের ৩ দিন' },
  gu: { currentWeather: 'વર્તમાન હવામાન', yourLocation: 'તમારું સ્થાન', dangerAlert: 'જોખમ ચેતવણી', weatherWarning: 'હવામાન ચેતવણી', goodConditions: 'સારી પરિસ્થિતિ', farmingAdvice: 'આજની ખેતી સલાહ', nextDays: 'આગળના 3 દિવસ' },
};

// ─── Farming Advice Dictionary ───────────────────────────────────────────────
const farmingAdvice: Record<string, Record<string, { icon: string; tip: string }[]>> = {
  en: {
    clear: [
      { icon: '💧', tip: 'Good day to irrigate crops in the morning.' },
      { icon: '🌱', tip: 'Ideal conditions for sowing and transplanting.' },
      { icon: '🚜', tip: 'Perfect weather for field preparation and tilling.' },
    ],
    rain: [
      { icon: '🚫', tip: 'Skip irrigation today — rain will provide moisture.' },
      { icon: '🧴', tip: 'Avoid pesticide spraying. Rain will wash it off.' },
      { icon: '🌊', tip: 'Check field drainage to prevent waterlogging.' },
    ],
    heat: [
      { icon: '⏰', tip: 'Water crops early morning or after sunset only.' },
      { icon: '🌿', tip: 'Apply mulch to retain soil moisture.' },
      { icon: '🧴', tip: 'Avoid chemical spraying — heat causes evaporation.' },
    ],
    frost: [
      { icon: '🛡️', tip: 'Cover tender plants and seedlings overnight.' },
      { icon: '💧', tip: 'Light irrigation before night helps prevent frost damage.' },
      { icon: '🚫', tip: 'Do not transplant seedlings during frost risk period.' },
    ],
    error: [{ icon: '📡', tip: 'Check your internet connection for weather updates.' }],
  },
  hi: {
    clear: [
      { icon: '💧', tip: 'सुबह फसलों की सिंचाई के लिए अच्छा दिन है।' },
      { icon: '🌱', tip: 'बुवाई और रोपाई के लिए एकदम सही स्थिति।' },
      { icon: '🚜', tip: 'खेत की तैयारी और जुताई के लिए सही मौसम।' },
    ],
    rain: [
      { icon: '🚫', tip: 'आज सिंचाई न करें — बारिश से नमी मिलेगी।' },
      { icon: '🧴', tip: 'कीटनाशक के छिड़काव से बचें। बारिश इसे धो देगी।' },
      { icon: '🌊', tip: 'जलभराव से बचने के लिए खेत की जल निकासी जाँचें।' },
    ],
    heat: [
      { icon: '⏰', tip: 'फसलों को केवल सुबह जल्दी या सूर्यास्त के बाद पानी दें।' },
      { icon: '🌿', tip: 'मिट्टी की नमी बनाए रखने के लिए मल्च का प्रयोग करें।' },
      { icon: '🧴', tip: 'रासायनिक छिड़काव से बचें — गर्मी से वाष्पीकरण होता है।' },
    ],
    frost: [
      { icon: '🛡️', tip: 'नाजुक पौधों और बीजों को रात भर ढक कर रखें।' },
      { icon: '💧', tip: 'रात से पहले हल्की सिंचाई पाले के नुकसान को रोकती है।' },
      { icon: '🚫', tip: 'पाले के जोखिम में पौधों की रोपाई न करें।' },
    ],
    error: [{ icon: '📡', tip: 'मौसम अपडेट के लिए इंटरनेट कनेक्शन जाँचें।' }],
  },
  mr: {
    clear: [
      { icon: '💧', tip: 'सकाळी पिकांना पाणी देण्यासाठी चांगला दिवस आहे।' },
      { icon: '🌱', tip: 'पेरणी आणि रोपण करण्यासाठी योग्य परिस्थिती।' },
      { icon: '🚜', tip: 'शेत तयार करण्यासाठी आणि नांगरणीसाठी योग्य हवामान।' },
    ],
    rain: [
      { icon: '🚫', tip: 'आज सिंचन करू नका — पावसामुळे ओलावा मिळेल।' },
      { icon: '🧴', tip: 'कीटकनाशक फवारणी टाळा. पाऊस ते धुऊन टाकेल।' },
      { icon: '🌊', tip: 'जलसाचण्यापासून बचावासाठी शेताची निचरा तपासा।' },
    ],
    heat: [
      { icon: '⏰', tip: 'पिकांना फक्त पहाटे किंवा सूर्यास्तानंतर पाणी द्या।' },
      { icon: '🌿', tip: 'मातीतील ओलावा टिकवण्यासाठी आच्छादन वापरा।' },
      { icon: '🧴', tip: 'रासायनिक फवारणी टाळा — उष्णतेमुळे बाष्पीभवन होते।' },
    ],
    frost: [
      { icon: '🛡️', tip: 'नाजूक रोपे रात्रभर झाकून ठेवा।' },
      { icon: '💧', tip: 'रात्रीपूर्वी हलके पाणी दिल्यास दंव नुकसान कमी होते।' },
      { icon: '🚫', tip: 'दंव जोखमीच्या काळात रोपे लावू नका।' },
    ],
    error: [{ icon: '📡', tip: 'हवामान अपडेटसाठी इंटरनेट कनेक्शन तपासा।' }],
  },
  pa: {
    clear: [
      { icon: '💧', tip: 'ਸਵੇਰੇ ਫਸਲਾਂ ਨੂੰ ਪਾਣੀ ਦੇਣ ਲਈ ਚੰਗਾ ਦਿਨ ਹੈ।' },
      { icon: '🌱', tip: 'ਬਿਜਾਈ ਅਤੇ ਪੌਦੇ ਲਗਾਉਣ ਲਈ ਢੁਕਵੀਆਂ ਸਥਿਤੀਆਂ।' },
      { icon: '🚜', tip: 'ਖੇਤ ਤਿਆਰ ਕਰਨ ਅਤੇ ਵਾਹੁਣ ਲਈ ਸਹੀ ਮੌਸਮ।' },
    ],
    rain: [
      { icon: '🚫', tip: 'ਅੱਜ ਸਿੰਚਾਈ ਨਾ ਕਰੋ — ਮੀਂਹ ਤੋਂ ਨਮੀ ਮਿਲੇਗੀ।' },
      { icon: '🧴', tip: 'ਕੀਟਨਾਸ਼ਕਾਂ ਦਾ ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਮੀਂਹ ਇਸਨੂੰ ਧੋ ਦੇਵੇਗਾ।' },
      { icon: '🌊', tip: 'ਪਾਣੀ ਭਰਨ ਤੋਂ ਬਚਾਉਣ ਲਈ ਖੇਤ ਦੀ ਨਿਕਾਸੀ ਜਾਂਚੋ।' },
    ],
    heat: [
      { icon: '⏰', tip: 'ਫਸਲਾਂ ਨੂੰ ਸਿਰਫ਼ ਸਵੇਰੇ ਜਲਦੀ ਜਾਂ ਸੂਰਜ ਛਿਪਣ ਤੋਂ ਬਾਅਦ ਪਾਣੀ ਦਿਓ।' },
      { icon: '🌿', tip: 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਰਕਰਾਰ ਰੱਖਣ ਲਈ ਮਲਚ ਵਰਤੋ।' },
      { icon: '🧴', tip: 'ਰਸਾਇਣਕ ਛਿੜਕਾਅ ਤੋਂ ਬਚੋ — ਗਰਮੀ ਨਾਲ ਭਾਫ਼ ਬਣਦੀ ਹੈ।' },
    ],
    frost: [
      { icon: '🛡️', tip: 'ਕੋਮਲ ਪੌਦਿਆਂ ਨੂੰ ਰਾਤ ਭਰ ਢੱਕ ਕੇ ਰੱਖੋ।' },
      { icon: '💧', tip: 'ਰਾਤ ਤੋਂ ਪਹਿਲਾਂ ਹਲਕੀ ਸਿੰਚਾਈ ਪਾਲੇ ਦੇ ਨੁਕਸਾਨ ਨੂੰ ਰੋਕਦੀ ਹੈ।' },
      { icon: '🚫', tip: 'ਪਾਲੇ ਦੇ ਖਤਰੇ ਦੌਰਾਨ ਬੂਟੇ ਨਾ ਲਗਾਓ।' },
    ],
    error: [{ icon: '📡', tip: 'ਮੌਸਮ ਅੱਪਡੇਟ ਲਈ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ।' }],
  },
  ta: {
    clear: [
      { icon: '💧', tip: 'காலையில் பயிர்களுக்கு நீர் பாய்ச்ச நல்ல நாள்.' },
      { icon: '🌱', tip: 'விதைப்பு மற்றும் நடவு செய்ய ஏற்ற சூழல்.' },
      { icon: '🚜', tip: 'வயல் தயாரிப்பு மற்றும் உழவுக்கு சரியான வானிலை.' },
    ],
    rain: [
      { icon: '🚫', tip: 'இன்று நீர்ப்பாசனம் தேவையில்லை — மழை ஈரப்பதம் தரும்.' },
      { icon: '🧴', tip: 'பூச்சிக்கொல்லி தெளிப்பதை தவிர்க்கவும். மழை கழுவிவிடும்.' },
      { icon: '🌊', tip: 'நீர் தேங்காமல் இருக்க வடிகால் சரிபார்க்கவும்.' },
    ],
    heat: [
      { icon: '⏰', tip: 'அதிகாலையில் அல்லது மாலையில் மட்டுமே பயிர்களுக்கு தண்ணீர் கொடுங்கள்.' },
<<<<<<< HEAD
      { icon: '🌿', tip: 'மண் ஈரப்பதம் தக்கவைக்க மల్చ్ ఉపయోగించండి.' },
      { icon: '🧴', tip: 'వేதி పిచికారీని నివారించండి — వేడి ఆవిరిని కలిగిస్తుంది.' },
=======
      { icon: '🌿', tip: 'மண் ஈரப்பதம் தக்கவைக்க மல்ச் பயன்படுத்தவும்.' },
      { icon: '🧴', tip: 'வேதி தெளிப்பதை தவிர்க்கவும் — வெப்பம் ஆவியாக்கும்.' },
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
    ],
    frost: [
      { icon: '🛡️', tip: 'மென்மையான செடிகளை இரவு முழுவதும் மூடி வையுங்கள்.' },
      { icon: '💧', tip: 'இரவுக்கு முன் இலேசான நீர்ப்பாசனம் பனி சேதத்தை தடுக்கும்.' },
      { icon: '🚫', tip: 'பனி அபாயக் காலத்தில் நாற்று நடவு செய்யாதீர்கள்.' },
    ],
    error: [{ icon: '📡', tip: 'வானிலை தகவலுக்கு இணைய இணைப்பை சரிபார்க்கவும்.' }],
  },
  te: {
    clear: [
      { icon: '💧', tip: 'పొద్దున పంటలకు నీరు పెట్టడానికి మంచి రోజు.' },
      { icon: '🌱', tip: 'విత్తనాలు నాటడానికి మరియు మార్పిడికి అనుకూలమైన పరిస్థితులు.' },
      { icon: '🚜', tip: 'పొలం తయారీ మరియు దుక్కికి సరైన వాతావరణం.' },
    ],
    rain: [
      { icon: '🚫', tip: 'ఈరోజు నీటిపారుదల వద్దు — వర్షం తేమ అందిస్తుంది.' },
      { icon: '🧴', tip: 'పురుగుల మందు పిచికారీ చేయకండి. వర్షం కడిగేస్తుంది.' },
      { icon: '🌊', tip: 'నీరు నిల్వకుండా పొలం నీటి పారుదల తనిఖీ చేయండి.' },
    ],
    heat: [
      { icon: '⏰', tip: 'పంటలకు తెల్లవారుజామున లేదా సూర్యాస్తమయం తర్వాత మాత్రమే నీరు పెట్టండి.' },
      { icon: '🌿', tip: 'మట్టి తేమ నిలుపుకోవడానికి మల్చ్ వాడండి.' },
      { icon: '🧴', tip: 'రసాయన పిచికారీ మానుకోండి — వేడి బాష్పీభవనం చేస్తుంది.' },
    ],
    frost: [
      { icon: '🛡️', tip: 'లేత మొక్కలను రాత్రంతా కప్పి ఉంచండి.' },
      { icon: '💧', tip: 'రాత్రికి ముందు తేలికపాటి నీటిపారుదల మంచు నష్టాన్ని నిరోధిస్తుంది.' },
      { icon: '🚫', tip: 'మంచు ప్రమాద కాలంలో మొక్కలు నాటవద్దు.' },
    ],
    error: [{ icon: '📡', tip: 'వాతావరణ నవీకరణల కోసం ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.' }],
  },
  bn: {
    clear: [
      { icon: '💧', tip: 'সকালে ফসলে সেচ দেওয়ার জন্য ভালো দিন।' },
      { icon: '🌱', tip: 'বীজ বপন ও চারা রোপণের জন্য আদর্শ পরিস্থিতি।' },
      { icon: '🚜', tip: 'জমি প্রস্তুত ও চাষের জন্য উপযুক্ত আবহাওয়া।' },
    ],
    rain: [
      { icon: '🚫', tip: 'আজ সেচ দেবেন না — বৃষ্টি আর্দ্রতা দেবে।' },
      { icon: '🧴', tip: 'কীটনাশক স্প্রে করবেন না। বৃষ্টি ধুয়ে ফেলবে।' },
      { icon: '🌊', tip: 'জলাবদ্ধতা রোধে জমির নিষ্কাশন পরীক্ষা করুন।' },
    ],
    heat: [
      { icon: '⏰', tip: 'ফসলে শুধু ভোরে বা সূর্যাস্তের পরে পানি দিন।' },
      { icon: '🌿', tip: 'মাটির আর্দ্রতা ধরে রাখতে মালচ ব্যবহার করুন।' },
      { icon: '🧴', tip: 'রাসায়নিক স্প্রে এড়িয়ে চলুন — তাপে বাষ্পীভবন হয়।' },
    ],
    frost: [
      { icon: '🛡️', tip: 'কোমল গাছ ও চারা সারারাত ঢেকে রাখুন।' },
      { icon: '💧', tip: 'রাতের আগে হালকা সেচ তুষারপাতের ক্ষতি রোধ করে।' },
      { icon: '🚫', tip: 'তুষারপাতের ঝুঁকির সময় চারা রোপণ করবেন না।' },
    ],
    error: [{ icon: '📡', tip: 'আবহাওয়া আপডেটের জন্য ইন্টারনেট সংযোগ পরীক্ষা করুন।' }],
  },
  gu: {
    clear: [
      { icon: '💧', tip: 'સવારે પાકને પિયત આપવા માટે સારો દિવસ.' },
      { icon: '🌱', tip: 'વાવણી અને રોપણી માટે આદર્શ પરિસ્થિતિ.' },
      { icon: '🚜', tip: 'ખેત તૈયારી અને ખેડાણ માટે યોગ્ય હવામાન.' },
    ],
    rain: [
      { icon: '🚫', tip: 'આજે સિંચાઈ ન કરો — વરસાદ ભેજ આપશે.' },
      { icon: '🧴', tip: 'જંતુનાશક છાંટવાનું ટાળો. વરસાદ ધોઈ નાખશે.' },
      { icon: '🌊', tip: 'પાણી ભરાઈ ન જાય તે માટે ખેતરનું ડ્રેનેજ ચકાસો.' },
    ],
    heat: [
      { icon: '⏰', tip: 'પાકને માત્ર વહેલી સવારે અથવા સૂર્યાસ્ત પછી પાણી આપો.' },
      { icon: '🌿', tip: 'જમીનનો ભેજ જાળવવા મલ્ચ વાપરો.' },
      { icon: '🧴', tip: 'રાસાયણિક છંટકાવ ટાળો — ગરમીથી બાષ્પીભવન થાય છે.' },
    ],
    frost: [
      { icon: '🛡️', tip: 'નાજુક છોડ અને રોપાઓ આખી રાત ઢાંકી રાખો.' },
      { icon: '💧', tip: 'રાત પહેલાં હળવી સિંચાઈ હિમ નુકસાન અટકાવે છે.' },
      { icon: '🚫', tip: 'હિમ જોખમ દરમિયાન રોપા રોપશો નહીં.' },
    ],
    error: [{ icon: '📡', tip: 'હવામાન અપડેટ માટે ઇન્ટરનેટ કનેક્શન તપાસો.' }],
  },
};

interface LedgerEntry {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
}

interface WeatherAlert {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  date: string;
}

const SmartTools: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'calendar';

  const [selectedCrop, setSelectedCrop] = useState<'wheat' | 'tomato'>('wheat');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [newEntry, setNewEntry] = useState<{ name: string; category: string; amount: string; type: 'expense' | 'income' }>({ name: '', category: 'Seeds', amount: '', type: 'expense' });
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

<<<<<<< HEAD
  // --- Govt Schemes State ---
  const [govtSchemes, setGovtSchemes] = useState<Scheme[]>([]);
  const [isSchemesLoading, setIsSchemesLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

=======
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
  const tabs = [
    { id: 'calendar', label: t('cropCalendar'), icon: Calendar },
    { id: 'alerts', label: t('weatherAlerts'), icon: AlertTriangle },
    { id: 'ledger', label: t('ledger'), icon: BookOpen },
    { id: 'schemes', label: t('schemes'), icon: FileText },
  ];

<<<<<<< HEAD
  // ─── Fetch Govt Schemes (Real-time & Offline) ────────────────────
  const fetchSchemes = async () => {
    setIsSchemesLoading(true);
    try {
      if (!navigator.onLine) {
        throw new Error('Offline');
      }

      const { data, error } = await supabase
        .from('govt_schemes')
        .select('*')
        .eq('language', language);

      if (error) throw error;

      if (data) {
        setGovtSchemes(data);
        localStorage.setItem(`schemes_${language}`, JSON.stringify(data));
      }
    } catch (err) {
      const cached = localStorage.getItem(`schemes_${language}`);
      if (cached) {
        setGovtSchemes(JSON.parse(cached));
      }
    } finally {
      setIsSchemesLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
    const handleOnline = () => { setIsOffline(false); fetchSchemes(); };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  // ─── Fetch Weather ────────────────────
=======
  // ─── Fetch Weather ──────────────────────────────────────────────────────────
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);

      const getWeather = async (lat: number, lon: number) => {
        try {
          const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();

          if (!data.list) throw new Error('Invalid format');

          const alerts: WeatherAlert[] = [];
          let heavyRain = false, heatWave = false, frost = false;

          data.list.slice(0, 24).forEach((item: any) => {
            const temp = item.main.temp_max;
            const rain = item.rain ? item.rain['3h'] || 0 : 0;
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });

            if (rain > 10 && !heavyRain) {
              heavyRain = true;
              alerts.push({ type: 'rain', message: `Heavy rain expected. Hold irrigation.`, severity: 'warning', date: dateStr });
            }
            if (temp > 40 && !heatWave) {
              heatWave = true;
              alerts.push({ type: 'heat', message: `Heat wave alert (${temp}°C). Increase watering.`, severity: 'danger', date: dateStr });
            }
            if (temp < 5 && !frost) {
              frost = true;
              alerts.push({ type: 'frost', message: `Frost possible (${temp}°C). Cover tender plants.`, severity: 'info', date: dateStr });
            }
          });

<<<<<<< HEAD
=======
          // ✅ FIX: Build the "clear" alert with real data from API
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
          if (alerts.length === 0) {
            alerts.push({
              type: 'clear',
              message: `Current temp is ${data.list[0].main.temp}°C in ${data.city.name}.`,
              severity: 'info',
              date: 'Next 3 days',
            });
          }

<<<<<<< HEAD
          setWeatherAlerts(alerts);
        } catch (err) {
          console.error('Error fetching weather:', err);
=======
          // ✅ FIX: setWeatherAlerts is now INSIDE try so it only runs on success
          setWeatherAlerts(alerts);
        } catch (err) {
          console.error('Error fetching weather:', err);
          // Only set error state if something actually went wrong
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
          setWeatherAlerts([{
            type: 'error',
            message: 'Could not load weather data.',
            severity: 'warning',
            date: 'Today',
          }]);
        } finally {
          setIsLoadingWeather(false);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => getWeather(position.coords.latitude, position.coords.longitude),
          (error) => {
            console.error('Geolocation error:', error);
            toast.error('Location permission denied. Using default location.');
            getWeather(21.1458, 79.0882);
          }
        );
      } else {
        toast.error('Geolocation not supported. Using default location.');
        getWeather(21.1458, 79.0882);
      }
    };

    if (activeTab === 'alerts') {
      fetchWeather();
    }
  }, [activeTab, language]);

<<<<<<< HEAD
  // ─── Fetch Ledger ──────────────────
=======
  // ─── Fetch Ledger ───────────────────────────────────────────────────────────
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
  useEffect(() => {
    const fetchLedger = async () => {
      if (!user) { setIsLoadingLedger(false); return; }
      try {
        setIsLoadingLedger(true);
        const { data, error } = await supabase
          .from('ledger_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        if (error) throw error;
        setLedgerEntries(data || []);
      } catch (err) {
        console.error('Error fetching ledger:', err);
        toast.error('Failed to load ledger entries');
      } finally {
        setIsLoadingLedger(false);
      }
    };
    if (activeTab === 'ledger') fetchLedger();
  }, [user, activeTab]);

  const addLedgerEntry = async () => {
    if (!user) { toast.error('Please login to add entries'); return; }
    if (newEntry.name && newEntry.amount) {
      const entryData = {
        user_id: user.id,
        name: newEntry.name,
        category: newEntry.category,
        amount: parseFloat(newEntry.amount),
        type: newEntry.type,
        date: new Date().toISOString().split('T')[0],
      };
      try {
        const { data, error } = await supabase.from('ledger_entries').insert([entryData]).select().single();
        if (error) throw error;
        setLedgerEntries([data, ...ledgerEntries]);
        setNewEntry({ name: '', category: 'Seeds', amount: '', type: 'expense' });
        toast.success('Entry added successfully');
      } catch (err) {
        console.error('Error adding entry:', err);
        toast.error('Failed to add ledger entry');
      }
    }
  };

  const deleteLedgerEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('ledger_entries').delete().eq('id', id);
      if (error) throw error;
      setLedgerEntries(ledgerEntries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry');
    }
  };

<<<<<<< HEAD
  const downloadLedgerPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.setTextColor(40, 167, 69); 
    doc.text(language === 'hi' ? 'किसान खाता रिपोर्ट' : 'Kisan Khata Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${date}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [[language === 'hi' ? 'विवरण' : 'Summary', language === 'hi' ? 'राशि' : 'Amount']],
      body: [
        [language === 'hi' ? 'कुल आय' : 'Total Income', `INR ${totalIncome}`],
        [language === 'hi' ? 'कुल खर्च' : 'Total Expense', `INR ${totalExpense}`],
        [language === 'hi' ? 'शुद्ध लाभ' : 'Net Profit', `INR ${netProfit}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [40, 167, 69] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [[
        language === 'hi' ? 'तारीख' : 'Date', 
        language === 'hi' ? 'नाम' : 'Name', 
        language === 'hi' ? 'श्रेणी' : 'Category', 
        language === 'hi' ? 'प्रकार' : 'Type', 
        language === 'hi' ? 'राशि' : 'Amount'
      ]],
      body: ledgerEntries.map(entry => [
        entry.date,
        entry.name,
        entry.category,
        entry.type === 'income' ? (language === 'hi' ? 'आय' : 'Income') : (language === 'hi' ? 'खर्च' : 'Expense'),
        `Rs. ${entry.amount}`
      ]),
      headStyles: { fillColor: [50, 50, 50] }
    });

    doc.save(`Kisan_Khata_${date}.pdf`);
  };
=======
  // लगभग लाइन 315 के आस-पास (deleteLedgerEntry के बाद)
const downloadLedgerPDF = () => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // PDF Header
  doc.setFontSize(20);
  doc.setTextColor(40, 167, 69); // Green color for Agriculture theme
  doc.text(language === 'hi' ? 'किसान खाता रिपोर्ट' : 'Kisan Khata Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${date}`, 14, 30);

  // Summary Table
  autoTable(doc, {
    startY: 40,
    head: [[language === 'hi' ? 'विवरण' : 'Summary', language === 'hi' ? 'राशि' : 'Amount']],
    body: [
      [language === 'hi' ? 'कुल आय' : 'Total Income', `INR ${totalIncome}`],
      [language === 'hi' ? 'कुल खर्च' : 'Total Expense', `INR ${totalExpense}`],
      [language === 'hi' ? 'शुद्ध लाभ' : 'Net Profit', `INR ${netProfit}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [40, 167, 69] }
  });

  // Entries Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [[
      language === 'hi' ? 'तारीख' : 'Date', 
      language === 'hi' ? 'नाम' : 'Name', 
      language === 'hi' ? 'श्रेणी' : 'Category', 
      language === 'hi' ? 'प्रकार' : 'Type', 
      language === 'hi' ? 'राशि' : 'Amount'
    ]],
    body: ledgerEntries.map(entry => [
      entry.date,
      entry.name,
      entry.category,
      entry.type === 'income' ? (language === 'hi' ? 'आय' : 'Income') : (language === 'hi' ? 'खर्च' : 'Expense'),
      `Rs. ${entry.amount}`
    ]),
    headStyles: { fillColor: [50, 50, 50] }
  });

  doc.save(`Kisan_Khata_${date}.pdf`);
};
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

  const totalIncome = ledgerEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = ledgerEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpense;

<<<<<<< HEAD
  const wt = weatherTranslations[language] || weatherTranslations['en'];

=======
  // Helper: get translated weather UI text
  const wt = weatherTranslations[language] || weatherTranslations['en'];

  // Helper: get farming advice for current weather + language
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
  const getAdvice = (type: string) => {
    const langAdvice = farmingAdvice[language] || farmingAdvice['en'];
    return langAdvice[type] || langAdvice['clear'];
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
<<<<<<< HEAD
=======
        {/* Header */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
        <div>
          <h1 className="text-xl font-bold">{t('tools')}</h1>
          <p className="text-xs text-muted-foreground">Essential farming tools</p>
        </div>

<<<<<<< HEAD
=======
        {/* Tabs */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? 'clay-inset text-primary' : 'clay-card text-muted-foreground'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

<<<<<<< HEAD
=======
        {/* Tab Content */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
        <AnimatePresence mode="wait">

          {/* ── Crop Calendar ── */}
          {activeTab === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex gap-2">
                {(['wheat', 'tomato'] as const).map((crop) => (
                  <motion.button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium capitalize ${selectedCrop === crop ? 'clay-inset text-primary' : 'clay-card'}`}
                  >
                    {crop === 'wheat' ? '🌾' : '🍅'} {crop}
                  </motion.button>
                ))}
              </div>
              <ClayCard>
                <h3 className="font-bold mb-4">{cropCalendarData[selectedCrop].crop} Calendar</h3>
                <div className="space-y-4">
                  {cropCalendarData[selectedCrop].stages.map((stage, index) => (
                    <motion.div key={stage.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center text-2xl">{stage.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{stage.name}</h4>
                        <p className="text-sm text-muted-foreground">{stage.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ClayCard>
            </motion.div>
          )}

          {/* ── Weather Alerts ── */}
          {activeTab === 'alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {isLoadingWeather ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <>
<<<<<<< HEAD
=======
                  {/* Main Weather Card */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
                  {weatherAlerts[0] && (
                    <ClayCard className="relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{wt.currentWeather}</p>
                          <h2 className="text-2xl font-bold">
                            {weatherAlerts[0].message.match(/[\d.]+°C/)?.[0] ?? '—'}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {weatherAlerts[0].message.match(/in (.+?)\./)?.[1] ?? wt.yourLocation}
                          </p>
                        </div>
                        <div className="text-6xl">
                          {weatherAlerts[0].type === 'rain' ? '🌧️' :
                           weatherAlerts[0].type === 'heat' ? '🌡️' :
                           weatherAlerts[0].type === 'frost' ? '❄️' : '🌤️'}
                        </div>
                      </div>

<<<<<<< HEAD
=======
                      {/* Status Badge */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${
                        weatherAlerts[0].severity === 'danger' ? 'bg-destructive/15 text-destructive' :
                        weatherAlerts[0].severity === 'warning' ? 'bg-yellow-500/15 text-yellow-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {weatherAlerts[0].severity === 'danger' ? wt.dangerAlert :
                         weatherAlerts[0].severity === 'warning' ? wt.weatherWarning : wt.goodConditions}
                      </div>

                      <p className="text-sm text-muted-foreground">{weatherAlerts[0].date}</p>
                    </ClayCard>
                  )}

<<<<<<< HEAD
=======
                  {/* Farming Advice Card */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
                  <ClayCard>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🌾</span>
                      <h3 className="font-bold">{wt.farmingAdvice}</h3>
                    </div>
                    <div className="space-y-3">
                      {getAdvice(weatherAlerts[0]?.type || 'clear').map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 clay-inset rounded-xl"
                        >
                          <span className="text-xl flex-shrink-0">{item.icon}</span>
                          <p className="text-sm leading-relaxed">{item.tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </ClayCard>

<<<<<<< HEAD
=======
                  {/* Extra Alerts */}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
                  {weatherAlerts.slice(1).map((alert, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <ClayCard className={`border-l-4 ${
                        alert.severity === 'danger' ? 'border-l-destructive' :
                        alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-primary'
                      }`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={
                            alert.severity === 'danger' ? 'text-destructive' :
                            alert.severity === 'warning' ? 'text-yellow-500' : 'text-primary'
                          } size={20} />
                          <div>
                            <p className="font-medium text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                          </div>
                        </div>
                      </ClayCard>
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ── Ledger ── */}
          {activeTab === 'ledger' && (
            <motion.div key="ledger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('income')}</p>
                  <p className="text-lg font-bold text-primary">₹{totalIncome.toLocaleString()}</p>
                </ClayCard>
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('expense')}</p>
                  <p className="text-lg font-bold text-destructive">₹{totalExpense.toLocaleString()}</p>
                </ClayCard>
                <ClayCard className="text-center p-4">
                  <p className="text-xs text-muted-foreground">{t('netProfit')}</p>
                  <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>₹{netProfit.toLocaleString()}</p>
                </ClayCard>
              </div>

              <ClayCard>
                <h3 className="font-bold mb-4">{t('addExpense')}</h3>
                <div className="space-y-3">
                  <Input placeholder="Name" value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })} className="clay-inset border-0" />
                  <div className="flex gap-2">
                    <Select value={newEntry.category} onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}>
                      <SelectTrigger className="clay-inset border-0 flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Seeds">{t('seeds')}</SelectItem>
                        <SelectItem value="Fertilizer">{t('fertilizer')}</SelectItem>
                        <SelectItem value="Labor">{t('labor')}</SelectItem>
                        <SelectItem value="Sale">Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as 'expense' | 'income' })}>
                      <SelectTrigger className="clay-inset border-0 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">{t('expense')}</SelectItem>
                        <SelectItem value="income">{t('income')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Amount (₹)" value={newEntry.amount} onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })} className="clay-inset border-0 flex-1" />
                    <ClayButton onClick={addLedgerEntry} variant="primary"><Plus size={18} /></ClayButton>
                  </div>
                </div>
              </ClayCard>

              <ClayCard>
                <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
                  <h3 className="font-bold">{language === 'hi' ? 'हालिया लेनदेन' : 'Recent Entries'}</h3>
                  {ledgerEntries.length > 0 && (
                    <button 
                      onClick={downloadLedgerPDF}
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Download size={14} />
                      {language === 'hi' ? 'डाउनलोड PDF' : 'Download PDF'}
                    </button>
                  )}
                </div>
=======
    <h3 className="font-bold">{language === 'hi' ? 'हालिया लेनदेन' : 'Recent Entries'}</h3>
    
    {/* नया डाउनलोड बटन */}
    {ledgerEntries.length > 0 && (
      <button 
        onClick={downloadLedgerPDF}
        className="flex items-center gap-2 text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
      >
        <Download size={14} />
        {language === 'hi' ? 'डाउनलोड PDF' : 'Download PDF'}
      </button>
    )}
  </div>
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df

                <div className="space-y-3">
                  {isLoadingLedger ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" size={24} /></div>
                  ) : ledgerEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noData')}</p>
                  ) : (
                    ledgerEntries.map((entry) => (
                      <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 clay-inset rounded-xl">
                        <div>
                          <p className="font-medium text-sm">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.category} • {entry.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${entry.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                            {entry.type === 'income' ? '+' : '-'}₹{entry.amount}
                          </span>
                          <button onClick={() => deleteLedgerEntry(entry.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ClayCard>
            </motion.div>
          )}

          {/* ── Govt Schemes ── */}
          {activeTab === 'schemes' && (
            <motion.div key="schemes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
<<<<<<< HEAD
              {isOffline && (
                <div className="bg-yellow-100 text-yellow-800 text-[10px] p-2 rounded-xl flex items-center gap-2">
                  <WifiOff size={14} /> {language === 'hi' ? 'आप ऑफलाइन हैं। पुराना डेटा दिख रहा है।' : 'Showing offline data.'}
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                  {language === 'hi' ? 'सरकारी योजनाएं' : 'Govt Schemes'}
                </h2>
                <button onClick={fetchSchemes} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <RefreshCw size={16} className={isSchemesLoading ? "animate-spin text-primary" : "text-muted-foreground"}/>
                </button>
              </div>

              {isSchemesLoading && govtSchemes.length === 0 ? (
                <div className="flex flex-col items-center py-10 opacity-50">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-xs">Updating Schemes...</p>
                </div>
              ) : (
                govtSchemes.map((scheme, index) => (
                  <motion.div key={scheme.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <ClayCard variant="hover">
                      <h3 className="font-bold text-primary mb-1">{scheme.name}</h3>
                      <p className="text-sm mb-3 leading-relaxed">{scheme.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border/50">
                          {scheme.eligibility}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-accent/20 text-accent-foreground">
                          {scheme.deadline}
                        </span>
                      </div>
                      <ClayButton 
                        variant="primary" 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => scheme.link && window.open(scheme.link, '_blank')}
                      >
                        {t('applyNow')}
                      </ClayButton>
                    </ClayCard>
                  </motion.div>
                ))
              )}
=======
              {govtSchemes.map((scheme, index) => (
                <motion.div key={scheme.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <ClayCard variant="hover">
                    <h3 className="font-bold text-primary mb-2">{scheme.name}</h3>
                    <p className="text-sm mb-3">{scheme.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">{scheme.eligibility}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/50">{scheme.deadline}</span>
                    </div>
                    <ClayButton variant="primary" size="sm">{t('applyNow')}</ClayButton>
                  </ClayCard>
                </motion.div>
              ))}
>>>>>>> 7d96f724218d846c0d47fe2311c66db07aa275df
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default SmartTools;