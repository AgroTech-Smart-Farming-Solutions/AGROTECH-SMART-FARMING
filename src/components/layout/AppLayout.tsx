import React from 'react';
import { motion } from 'framer-motion';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showNav = true }) => {
  if (!showNav) {
    return (
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        <BackgroundEffects />
        <main className="relative z-10 flex-1 pb-20 lg:pb-8 pt-16 lg:pt-4">
          <div className="max-w-7xl mx-auto h-full px-2 sm:px-4 lg:px-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-x-hidden">
        <BackgroundEffects />
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <Header />
          </div>

          {/* Desktop top bar with trigger */}
          <div className="hidden lg:flex items-center h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="mr-3" />
            <span className="text-sm text-muted-foreground">AgroTech</span>
          </div>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex-1 pb-28 lg:pb-8 pt-20 lg:pt-4"
          >
            <div className="container max-w-4xl mx-auto px-3 sm:px-4">
              {children}
            </div>
          </motion.main>

          {/* Mobile Nav */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const BackgroundEffects: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-accent/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2], x: ['33%', '40%', '33%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-primary/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"
      animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />
    <div
      className="absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);
