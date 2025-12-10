
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Loader2 } from 'lucide-react';
import { useLanguage, useTranslation } from '@/hooks/use-translation';
import { menuItems } from './sidebar-nav';

const pageTitles: { [key: string]: string } = {
  '/': 'Get Started',
  '/dashboard': 'Dashboard',
  '/crop-recommendation': 'Crop Recommendation',
  '/disease-detection': 'Disease Detection',
  '/market-analysis': 'Market Analysis',
  '/sustainability-score': 'Sustainability Score',
  '/community': 'Community Forum',
  '/achievements': 'Achievements',
  '/education': 'Educational Modules',
  '/profile': 'Your Profile',
};
const originalText = pageTitles;


export function SimpleHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const { selectedLang, handleLanguageChange, isTranslating, languages } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
      <header className="absolute top-0 z-20 w-full p-4 flex justify-end">
          {isMounted && (
            <div className="w-full max-w-[200px]">
               <Select value={selectedLang} onValueChange={handleLanguageChange} disabled={isTranslating}>
                <SelectTrigger className="bg-background/80 backdrop-blur-sm">
                  {isTranslating ? <Loader2 className="mr-2 animate-spin" /> : <Globe className="mr-2" />}
                  <SelectValue placeholder="Translate Page..." />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
      </header>
  );
}


export function Header() {
  const pathname = usePathname();
  const { translatedText } = useTranslation(originalText);
  const title = translatedText[pageTitles[pathname]] || pageTitles[pathname] || 'CropNavi';
  const [isMounted, setIsMounted] = useState(false);
  const { selectedLang, handleLanguageChange, isTranslating, languages } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="font-headline text-xl font-semibold hidden md:block">{title}</h1>
      
      {isMounted && (
        <div className="ml-auto flex items-center gap-4">
          <div className="w-full md:w-48">
            <Select value={selectedLang} onValueChange={handleLanguageChange} disabled={isTranslating}>
              <SelectTrigger className="bg-background">
                {isTranslating ? <Loader2 className="mr-2 animate-spin"/> : <Globe className="mr-2" />}
                <SelectValue placeholder="Translate Page..." />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UserNav />
        </div>
      )}
    </header>
  );
}
