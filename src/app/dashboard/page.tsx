
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Sprout,
  ScanLine,
  LineChart,
  Recycle,
  Users,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { WeatherCard } from './weather-card';


const originalFeatures = [
  {
    title: 'AI Crop Recommendation',
    description: 'Get AI-driven crop suggestions based on your soil and climate.',
    icon: Sprout,
    href: '/crop-recommendation',
    image: placeholderImages.find(p => p.id === 'crop-recommendation'),
  },
  {
    title: 'AI Disease Detection',
    description: 'Upload a photo to diagnose plant diseases instantly.',
    icon: ScanLine,
    href: '/disease-detection',
    image: placeholderImages.find(p => p.id === 'disease-detection'),
  },
  {
    title: 'Market Analysis',
    description: 'Analyze market trends and prices for your crops.',
    icon: LineChart,
    href: '/market-analysis',
    image: placeholderImages.find(p => p.id === 'market-analysis'),
  },
  {
    title: 'Sustainability Score',
    description: 'Calculate and improve your farm’s sustainability rating.',
    icon: Recycle,
    href: '/sustainability-score',
    image: placeholderImages.find(p => p.id === 'sustainability-score'),
  },
  {
    title: 'Community Forum',
    description: 'Connect with other farmers, ask questions, and share knowledge.',
    icon: Users,
    href: '/community',
    image: placeholderImages.find(p => p.id === 'community-forum'),
  },
    {
    title: 'Achievements',
    description: 'Track your progress and earn badges for your farming skills.',
    icon: Trophy,
    href: '/achievements',
    image: placeholderImages.find(p => p.id === 'achievements'),
  },
];

const originalText = {
  title: 'Welcome, Farmer!',
  subtitle: 'Here are the tools to help you grow smarter.',
  ...Object.fromEntries(originalFeatures.flatMap(f => [[f.title, f.title], [`${f.title}_desc`, f.description]] as const)),
};


export default function DashboardPage() {
  const { translatedText, T } = useTranslation(originalText);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          <T textKey="title" />
        </h1>
        <p className="text-muted-foreground">
          <T textKey="subtitle" />
        </p>
      </div>

      <WeatherCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {originalFeatures.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline group-hover:text-primary transition-colors">
                     <T textKey={feature.title as keyof typeof originalText} />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between gap-4">
                 <CardDescription>
                  <T textKey={`${feature.title}_desc` as keyof typeof originalText} />
                 </CardDescription>
                {feature.image && (
                  <div className="mt-auto aspect-video w-full overflow-hidden rounded-md">
                    <Image
                      src={feature.image.imageUrl}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={feature.image.imageHint}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
