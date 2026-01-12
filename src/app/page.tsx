
'use client';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/hooks/use-translation';



const originalText = {
  headline: 'AI Crop Recommendation for Farmers',
  button: 'Get Started',
};

export default function GetStartedPage() {
  const { translatedText, T } = useTranslation(originalText);
  const { selectedLang } = useLanguage();

  return (
    <div className="relative h-full flex-grow flex flex-col justify-center overflow-hidden">
      {/* Immersive Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
        style={{ backgroundImage: `url('/images/lush_farm_sunrise.png')` }}
        data-ai-hint="lush smart farm at sunrise"
      ></div>

      {/* Gradient Overlay for Readability & Mood */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center flex flex-col items-center gap-6 max-w-3xl glass p-8 md:p-12 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-emerald-950 dark:text-emerald-50 drop-shadow-sm">
            <T textKey="headline" />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Empowering Tamil Nadu's farmers with AI-driven insights for smarter crops and better yields.
          </p>
          <div className="flex gap-4 mt-2">
            <Button asChild size="lg" className="h-12 px-8 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 rounded-full">
              <Link href={`/login?lang=${selectedLang}`}>
                <T textKey="button" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
