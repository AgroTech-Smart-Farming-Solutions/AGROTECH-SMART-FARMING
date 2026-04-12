import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface WeatherAlert {
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  date: string;
}

const weatherTranslations: Record<string, any> = {
  en: { currentWeather: 'Current Weather', yourLocation: 'Your Location', dangerAlert: 'Danger Alert', weatherWarning: 'Weather Warning', goodConditions: 'Good Conditions', farmingAdvice: 'Farming Advice Today', nextDays: 'Next 3 days' },
  hi: { currentWeather: 'वर्तमान मौसम', yourLocation: 'आपका स्थान', dangerAlert: 'खतरे की चेतावनी', weatherWarning: 'मौसम की चेतावनी', goodConditions: 'अच्छी स्थिति', farmingAdvice: 'आज के लिए कृषि सलाह', nextDays: 'अगले 3 दिन' },
  // ... (You can add other languages here if needed, keeping it brief for now)
};

const farmingAdvice: Record<string, any> = {
  en: {
    clear: [{ icon: '💧', tip: 'Good day to irrigate crops in the morning.' }, { icon: '🌱', tip: 'Ideal conditions for sowing and transplanting.' }, { icon: '🚜', tip: 'Perfect weather for field preparation and tilling.' }],
    rain: [{ icon: '🚫', tip: 'Skip irrigation today — rain will provide moisture.' }, { icon: '🧴', tip: 'Avoid pesticide spraying. Rain will wash it off.' }, { icon: '🌊', tip: 'Check field drainage to prevent waterlogging.' }],
    heat: [{ icon: '⏰', tip: 'Water crops early morning or after sunset only.' }, { icon: '🌿', tip: 'Apply mulch to retain soil moisture.' }, { icon: '🧴', tip: 'Avoid chemical spraying — heat causes evaporation.' }],
    frost: [{ icon: '🛡️', tip: 'Cover tender plants and seedlings overnight.' }, { icon: '💧', tip: 'Light irrigation before night helps prevent frost damage.' }, { icon: '🚫', tip: 'Do not transplant seedlings during frost risk period.' }],
    error: [{ icon: '📡', tip: 'Check your internet connection for weather updates.' }],
  },
  hi: {
    clear: [{ icon: '💧', tip: 'सुबह फसलों की सिंचाई के लिए अच्छा दिन है।' }, { icon: '🌱', tip: 'बुवाई और रोपाई के लिए एकदम सही स्थिति।' }, { icon: '🚜', tip: 'खेत की तैयारी और जुताई के लिए सही मौसम।' }],
    rain: [{ icon: '🚫', tip: 'आज सिंचाई न करें — बारिश से नमी मिलेगी।' }, { icon: '🧴', tip: 'कीटनाशक के छिड़काव से बचें। बारिश इसे धो देगी।' }, { icon: '🌊', tip: 'जलभराव से बचने के लिए खेत की जल निकासी जाँचें।' }],
    heat: [{ icon: '⏰', tip: 'फसलों को केवल सुबह जल्दी या सूर्यास्त के बाद पानी दें।' }, { icon: '🌿', tip: 'मिट्टी की नमी बनाए रखने के लिए मल्च का प्रयोग करें।' }, { icon: '🧴', tip: 'रासायनिक छिड़काव से बचें — गर्मी से वाष्पीकरण होता है।' }],
    frost: [{ icon: '🛡️', tip: 'नाजुक पौधों और बीजों को रात भर ढक कर रखें।' }, { icon: '💧', tip: 'रात से पहले हल्की सिंचाई पाले के नुकसान को रोकती है।' }, { icon: '🚫', tip: 'पाले के जोखिम में पौधों की रोपाई न करें।' }],
    error: [{ icon: '📡', tip: 'मौसम अपडेट के लिए इंटरनेट कनेक्शन जाँचें।' }],
  },
};

const WeatherAlerts: React.FC = () => {
  const { t, language } = useLanguage();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      const getWeather = async (lat: number, lon: number) => {
        try {
          const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
          const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
          const data = await response.json();

          if (!data.list) throw new Error('Invalid format');

          const alerts: WeatherAlert[] = [];
          let heavyRain = false, heatWave = false, frost = false;

          data.list.slice(0, 24).forEach((item: any) => {
            const temp = item.main.temp_max;
            const rain = item.rain ? item.rain['3h'] || 0 : 0;
            const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            if (rain > 10 && !heavyRain) { heavyRain = true; alerts.push({ type: 'rain', message: `Heavy rain expected. Hold irrigation.`, severity: 'warning', date: dateStr }); }
            if (temp > 40 && !heatWave) { heatWave = true; alerts.push({ type: 'heat', message: `Heat wave alert (${temp}°C). Increase watering.`, severity: 'danger', date: dateStr }); }
            if (temp < 5 && !frost) { frost = true; alerts.push({ type: 'frost', message: `Frost possible (${temp}°C). Cover tender plants.`, severity: 'info', date: dateStr }); }
          });

          if (alerts.length === 0) {
            alerts.push({ type: 'clear', message: `Current temp is ${data.list[0].main.temp}°C in ${data.city.name}.`, severity: 'info', date: 'Next 3 days' });
          }
          setWeatherAlerts(alerts);
        } catch (err) {
          console.error('Error fetching weather:', err);
          setWeatherAlerts([{ type: 'error', message: 'Could not load weather data.', severity: 'warning', date: 'Today' }]);
        } finally {
          setIsLoadingWeather(false);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => getWeather(position.coords.latitude, position.coords.longitude),
          (error) => { console.error('Geolocation error:', error); toast.error('Location permission denied. Using default location.'); getWeather(21.1458, 79.0882); }
        );
      } else {
        toast.error('Geolocation not supported. Using default location.');
        getWeather(21.1458, 79.0882);
      }
    };
    fetchWeather();
  }, [language]);

  const wt = weatherTranslations[language] || weatherTranslations['en'];
  const getAdvice = (type: string) => {
    const langAdvice = farmingAdvice[language] || farmingAdvice['en'];
    return langAdvice[type] || langAdvice['clear'];
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">{t('weatherAlerts') || 'Weather Alerts'}</h1>
          <p className="text-xs text-muted-foreground">Stay updated with local weather</p>
        </div>

        {isLoadingWeather ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {weatherAlerts[0] && (
              <ClayCard className="relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{wt.currentWeather}</p>
                    <h2 className="text-2xl font-bold">{weatherAlerts[0].message.match(/[\d.]+°C/)?.[0] ?? '—'}</h2>
                    <p className="text-sm text-muted-foreground">{weatherAlerts[0].message.match(/in (.+?)\./)?.[1] ?? wt.yourLocation}</p>
                  </div>
                  <div className="text-6xl">
                    {weatherAlerts[0].type === 'rain' ? '🌧️' : weatherAlerts[0].type === 'heat' ? '🌡️' : weatherAlerts[0].type === 'frost' ? '❄️' : '🌤️'}
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${weatherAlerts[0].severity === 'danger' ? 'bg-destructive/15 text-destructive' : weatherAlerts[0].severity === 'warning' ? 'bg-yellow-500/15 text-yellow-600' : 'bg-primary/10 text-primary'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {weatherAlerts[0].severity === 'danger' ? wt.dangerAlert : weatherAlerts[0].severity === 'warning' ? wt.weatherWarning : wt.goodConditions}
                </div>
                <p className="text-sm text-muted-foreground">{weatherAlerts[0].date}</p>
              </ClayCard>
            )}

            <ClayCard>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🌾</span>
                <h3 className="font-bold">{wt.farmingAdvice}</h3>
              </div>
              <div className="space-y-3">
                {getAdvice(weatherAlerts[0]?.type || 'clear').map((item: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-3 clay-inset rounded-xl">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <p className="text-sm leading-relaxed">{item.tip}</p>
                  </motion.div>
                ))}
              </div>
            </ClayCard>

            {weatherAlerts.slice(1).map((alert, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <ClayCard className={`border-l-4 ${alert.severity === 'danger' ? 'border-l-destructive' : alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-primary'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={alert.severity === 'danger' ? 'text-destructive' : alert.severity === 'warning' ? 'text-yellow-500' : 'text-primary'} size={20} />
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                    </div>
                  </div>
                </ClayCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default WeatherAlerts;