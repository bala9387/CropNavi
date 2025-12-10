
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, PlayCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import Image from "next/image";

const originalText = {
  title: 'Educational Modules',
  description: 'Expand your farming knowledge with our curated list of video tutorials and guides.',
  video1Title: 'Water & Resource Management',
  video1Desc: 'Explore how smart, water-saving irrigation systems can deliver water precisely where it\'s needed.',
  video2Title: 'Livestock & Allied Activities',
  video2Desc: 'An introduction to integrating animal husbandry with agriculture for diversified income.',
  video3Title: 'Crop Production & Practices',
  video3Desc: 'An overview of modern irrigation systems that help conserve water and improve crop yields.',
  video4Title: 'Modern Tech in Farming',
  video4Desc: 'A look at modern agricultural machinery and technology that are transforming farming.',
  video5Title: 'Sustainability & Community',
  video5Desc: 'Learn how sustainable practices and community collaboration can lead to better farming outcomes.',
};

const educationalVideos = [
    {
        id: '1SYzegqSnRE',
        titleKey: 'video1Title',
        descriptionKey: 'video1Desc',
    },
    {
        id: '75Qjyxt_Qq4',
        titleKey: 'video2Title',
        descriptionKey: 'video2Desc',
    },
    {
        id: 'QVqRZYseOlo',
        titleKey: 'video3Title',
        descriptionKey: 'video3Desc',
    },
    {
        id: 'LG21FQNTAwo',
        titleKey: 'video4Title',
        descriptionKey: 'video4Desc',
    },
    {
        id: 'kMulwLbDBPI',
        titleKey: 'video5Title',
        descriptionKey: 'video5Desc',
    },
];

export default function EducationPage() {
  const { translatedText, T } = useTranslation(originalText);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleVideoPlay = (videoId: string) => {
    setActiveVideo(videoId);
  };
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary"/>
            <T textKey="title" />
        </h1>
        <p className="text-muted-foreground">
            <T textKey="description" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educationalVideos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-black">
                  {activeVideo === video.id ? (
                      <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                      ></iframe>
                  ) : (
                      <div className="w-full h-full relative cursor-pointer" onClick={() => handleVideoPlay(video.id)}>
                        <Image
                          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                          alt={`Thumbnail for video ${translatedText[video.titleKey as keyof typeof originalText]}`}
                          layout="fill"
                          objectFit="cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <PlayCircle className="size-16 text-white/80 hover:text-white transition-colors" />
                        </div>
                      </div>
                  )}
                </div>
            </CardContent>
             <CardHeader>
              <CardTitle className="font-headline text-xl">
                <T textKey={video.titleKey as keyof typeof originalText} />
              </CardTitle>
              <CardDescription>
                 <T textKey={video.descriptionKey as keyof typeof originalText} />
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
