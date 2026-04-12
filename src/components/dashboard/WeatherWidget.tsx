import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Droplets, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';
import { useLanguage } from '@/contexts/LanguageContext';

const mapCondition = (main: string) => {
  if (main === 'Clear') return 'sunny';
  if (main === 'Rain' || main === 'Drizzle' || main === 'Thunderstorm') return 'rain';
  return 'cloudy';
};

const WeatherIcon: React.FC<{ condition: string; size?: number; className?: string }> = ({ 
  condition, size = 32, className = "" 
}) => {
  switch (condition) {
    case 'sun':
    case 'sunny':
      return <Sun size={size} className={`text-accent ${className}`} />;
    case 'cloud':
    case 'cloudy':
      return <Cloud size={size} className={`text-muted-foreground ${className}`} />;
    case 'rain':
    case 'rainy':
      return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    default:
      return <Sun size={size} className={`text-accent ${className}`} />;
  }
};

const getLocaleCode = (lang: string) => {
  const map: Record<string, string> = {
    en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', pa: 'pa-IN',
    ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', gu: 'gu-IN'
  };
  return map[lang] || 'en-IN';
};

export const WeatherWidget: React.FC = () => {
  const { t, language } = useLanguage(); 
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   
    const fetchWeather = async (lat: number, lon: number, language: string) => {
  try {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.list) {
      throw new Error("Invalid format: Missing forecast list");
    }

    const current = data.list[0];
    const localeCode = getLocaleCode(language); 
    const dailyForecast: any[] = [];
const seenDays = new Set();

for (const item of data.list) {
  const dateObj = new Date(item.dt * 1000);
  const dateString = dateObj.toLocaleDateString();

  if (!seenDays.has(dateString)) {
    seenDays.add(dateString);
    const isFirst = seenDays.size === 1;
    dailyForecast.push({
      day: isFirst ? 'Today' : new Intl.DateTimeFormat(localeCode, { weekday: 'short' }).format(dateObj),
      temp: Math.round(item.main.temp),
      icon: mapCondition(item.weather[0].main)
    });
  }

  if (dailyForecast.length === 5) break;
}

    setWeatherData({
      condition: mapCondition(current.weather[0].main),
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6),
      rainChance: Math.round((current.pop || 0) * 100),
      location: data.city.name,
      uvIndex: 6, 
      forecast: dailyForecast,
    });
  } catch (err) {
    console.error('Error fetching widget weather:', err);
  } finally {
    setIsLoading(false);
  }
};

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
      (position) => fetchWeather(position.coords.latitude, position.coords.longitude, language),
      (error) => fetchWeather(21.1458, 79.0882, language)
    );
  } else {
    fetchWeather(21.1458, 79.0882, language);
  }
  }, [language]);

  if (isLoading || !weatherData) {
    return (
      <ClayCard className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </ClayCard>
    );
  }

  return (
    <ClayCard className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent via-accent/50 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/40 to-transparent rounded-full blur-2xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      
      <div className="relative z-10">
        {/* Header with location */}
        <div className="flex items-center justify-between mb-4">
          <motion.div className="flex items-center gap-1.5 text-xs text-muted-foreground" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <MapPin size={12} />
            <span className="font-medium">{weatherData.location}</span>
          </motion.div>
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">
            {t('weather')}
          </span>
        </div>

        {/* Main weather display */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              animate={{ 
                rotate: weatherData.condition === 'sunny' ? [0, 10, -10, 0] : 0,
                y: weatherData.condition !== 'sunny' ? [0, -3, 0] : 0
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center backdrop-blur-sm">
                <WeatherIcon condition={weatherData.condition} size={48} />
              </div>
              <motion.div 
                className="absolute inset-0 rounded-3xl bg-accent/20 blur-xl -z-10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Temperature display */}
            <div>
              <div className="flex items-start">
                <motion.span 
                  className="text-5xl sm:text-6xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                >
                  {weatherData.temperature}
                </motion.span>
                <span className="text-2xl font-light text-muted-foreground mt-1">°C</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('feelsLike')} <span className="font-semibold text-foreground">{weatherData.feelsLike}°</span>
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="hidden sm:flex flex-col gap-2">
            <motion.div className="clay-inset px-3 py-2 rounded-xl flex items-center gap-2" whileHover={{ scale: 1.02 }}>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplets size={14} className="text-blue-500" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('humidity')}</span>
                <p className="text-sm font-bold">{weatherData.humidity}%</p>
              </div>
            </motion.div>
            <motion.div className="clay-inset px-3 py-2 rounded-xl flex items-center gap-2" whileHover={{ scale: 1.02 }}>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Wind size={14} className="text-muted-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('wind')}</span>
                <p className="text-sm font-bold">{weatherData.windSpeed} {t('kmh')}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Stats Row */}
        <div className="flex sm:hidden gap-3 mb-4">
          <div className="flex-1 clay-inset px-3 py-2 rounded-xl flex items-center gap-2">
            <Droplets size={14} className="text-blue-500" />
            <span className="text-sm font-semibold">{weatherData.humidity}%</span>
          </div>
          <div className="flex-1 clay-inset px-3 py-2 rounded-xl flex items-center gap-2">
            <Wind size={14} className="text-muted-foreground" />
            <span className="text-sm font-semibold">{weatherData.windSpeed} {t('kmh')}</span>
          </div>
          <div className="flex-1 clay-inset px-3 py-2 rounded-xl flex items-center gap-2">
            <Thermometer size={14} className="text-orange-500" />
            <span className="text-sm font-semibold">UV {weatherData.uvIndex}</span>
          </div>
        </div>

        {/* Rain Alert */}
        {weatherData.rainChance > 15 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 px-4 py-3 rounded-2xl mb-4 flex items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"
            >
              <CloudRain size={20} className="text-blue-500" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {weatherData.rainChance}% {t('rainAlert') || 'Rain Alert'}
              </p>
              <p className="text-[10px] text-muted-foreground">Consider delaying irrigation</p>
            </div>
          </motion.div>
        )}

        {/* 5-Day Forecast */}
        <div className="clay-inset rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            {t('fiveDayForecast')}
          </p>
          <div className="flex justify-between">
            {weatherData.forecast.map((day: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.1, y: -2 }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <span className="text-[10px] text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  {day.day}
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <WeatherIcon condition={day.icon} size={18} />
                </div>
                <span className="text-xs font-bold group-hover:text-primary transition-colors">
                  {day.temp}°
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ClayCard>
  );
};