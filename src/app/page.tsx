
'use client';
import { Button } from '@/components/ui/button';
import { placeholderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/hooks/use-translation';

const farmerBgImage = placeholderImages.find(p => p.id === 'get-started-background');

const originalText = {
  headline: 'AI Crop Recommendation for Farmers',
  button: 'Get Started',
};

export default function GetStartedPage() {
  const { translatedText, T } = useTranslation(originalText);
  const { selectedLang } = useLanguage();

  return (
    <div className="relative h-full flex-grow">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-50"
        style={{backgroundImage: `url(${farmerBgImage?.imageUrl})`}}
        data-ai-hint={farmerBgImage?.imageHint}
      ></div>
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
            <T textKey="headline" />
          </h1>
          <Button asChild size="lg">
            <Link href={`/login?lang=${selectedLang}`}>
              <T textKey="button" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
