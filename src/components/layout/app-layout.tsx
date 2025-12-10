
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header, SimpleHeader } from './header';
import { SidebarNav } from './sidebar-nav';
import { usePathname } from 'next/navigation';
import { ChatWidget } from '@/components/chatbot/chat-widget';
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { MenuItem } from './sidebar-nav';
import {
  LayoutDashboard,
  Sprout,
  ScanLine,
  LineChart,
  Recycle,
  Users,
  Trophy,
  BookOpen,
  ShoppingCart,
  Package,
  Receipt,
} from 'lucide-react';


const originalMenuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crop-recommendation', label: 'Crop Recommendation', icon: Sprout },
  { href: '/market-analysis', label: 'Market Analysis', icon: LineChart },
  { href: '/sustainability-score', label: 'Sustainability Score', icon: Recycle },
  { href: '/disease-detection', label: 'Disease Detection', icon: ScanLine },
  { href: '/community', label: 'Community Forum', icon: Users },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/education', label: 'Educational Modules', icon: BookOpen },
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/sales', label: 'Sales History', icon: Receipt },
];

const originalText = Object.fromEntries(originalMenuItems.map(item => [item.label, item.label]));


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  const { translatedText, isTranslating } = useTranslation(originalText);

  const translatedMenuItems = originalMenuItems.map(item => ({
    ...item,
    label: translatedText[item.label] || item.label,
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (pathname === '/login' || pathname === '/') {
    return (
       <main className="flex-1 overflow-y-auto bg-background h-svh relative">
            <SimpleHeader />
            {children}
        </main>
    )
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav menuItems={translatedMenuItems} isTranslating={isTranslating} />
      </Sidebar>
      <SidebarInset>
        <div className='flex flex-col h-svh'>
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
            {children}
          </main>
          {isClient && <ChatWidget />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
