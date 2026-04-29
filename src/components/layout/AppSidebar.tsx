import React from 'react';
import { 
  Home, MessageCircle, ScanLine, TrendingUp, Play, Moon, Sun, 
  Languages, Crown, Calendar, AlertTriangle, BookOpen, FileText 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import logoImg from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- MAIN NAV (Agri Shorts ko yahan move kar diya) ---
const mainNav = [
  { icon: Home, path: '/', key: 'home', label: 'Dashboard' },
  { icon: MessageCircle, path: '/chat', key: 'chat', label: 'AI Chat', badge: 'AI' },
  { icon: ScanLine, path: '/scan', key: 'scan', label: 'Dr. Disease' },
  { icon: Play, path: '/reels', key: 'reels', label: 'Agri Shorts' },
];

// --- TOOLS NAV (Ab isme 5 alag tools hain) ---
const toolsNav = [
  { icon: Calendar, path: '/calendar', key: 'cropCalendar', label: 'Crop Calendar' },
  { icon: AlertTriangle, path: '/alerts', key: 'weatherAlerts', label: 'Weather Alerts' },
  { icon: BookOpen, path: '/ledger', key: 'ledger', label: 'Kisan Khata' },
  { icon: FileText, path: '/schemes', key: 'schemes', label: 'Govt Schemes' },
  { icon: TrendingUp, path: '/prices', key: 'prices', label: 'Prices' },
];

export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const languages = ['en', 'hi', 'mr', 'pa', 'ta', 'te', 'bn', 'gu'] as const;
  
  const languageNames: Record<string, string> = { en: 'EN', hi: 'हि', mr: 'म', pa: 'ਪੰ', ta: 'த', te: 'తె', bn: 'বা', gu: 'ગુ' };
  
  const fullLanguageNames: Record<string, string> = { 
    en: 'English', hi: 'हिन्दी', mr: 'मराठी', pa: 'ਪੰਜਾਬੀ', 
    ta: 'தமிழ்', te: 'తెలుగు', bn: 'বাংলা', gu: 'ગુજરાતી' 
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shrink-0 bg-card">
            <img src={logoImg} alt="AgroTech" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-extrabold text-base text-sidebar-foreground whitespace-nowrap">
                Agro<span className="text-sidebar-primary">Tech</span>
              </h2>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">{t('smartFarming') || 'Smart Farming'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-custom">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {!collapsed && (language === 'hi' ? 'मुख्य' : 'Main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={active}
                      tooltip={collapsed ? t(item.key) : undefined}
                      className={`h-11 rounded-xl transition-all ${
                        active
                          ? 'bg-sidebar-primary/12 text-sidebar-primary font-bold'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                      {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                          <span className="text-[13px]">{t(item.key) || item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-md bg-sidebar-primary/15 text-sidebar-primary">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {!collapsed && (language === 'hi' ? 'उपकरण' : 'Tools')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={active}
                      tooltip={collapsed ? t(item.key) : undefined}
                      className={`h-11 rounded-xl transition-all ${
                        active
                          ? 'bg-sidebar-primary/12 text-sidebar-primary font-bold'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                      {!collapsed && <span className="text-[13px]">{t(item.key) || item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-1">
        <div className={`flex ${collapsed ? 'flex-col' : ''} gap-1`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full outline-none">
                <Languages size={18} className="shrink-0" />
                {!collapsed && <span className="text-[13px] font-medium">{languageNames[language]}</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side={collapsed ? "right" : "top"} 
              align="start" 
              className="w-40 rounded-xl"
            >
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang} 
                  onClick={() => setLanguage(lang)}
                  className={`cursor-pointer rounded-lg ${language === lang ? 'bg-sidebar-primary/15 text-sidebar-primary font-bold' : ''}`}
                >
                  {fullLanguageNames[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            {theme === 'dark' ? <Moon size={18} className="shrink-0" /> : <Sun size={18} className="shrink-0" />}
            {!collapsed && <span className="text-[13px] font-medium">{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>}
          </button>
        </div>

        {!collapsed && (
          <button
            onClick={() => navigate('/subscription')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sidebar-primary/15 to-accent/10 text-sidebar-primary hover:from-sidebar-primary/25 transition-all"
          >
            <Crown size={16} />
            <span className="text-[12px] font-bold">{t('upgradePro')}</span>
          </button>
        )}

        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-accent/20 flex items-center justify-center text-sidebar-primary font-bold text-sm shrink-0 border border-sidebar-primary/20 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                profile?.name?.charAt(0) || 'U'
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-xs font-bold text-sidebar-foreground truncate">{profile?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {profile?.username ? `@${profile.username}` : profile?.location || ''}
                </p>
              </div>
            )}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};