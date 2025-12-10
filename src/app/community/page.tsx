
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

const originalText = {
  title: "Community Forum",
  description: "Connect with farmers, share, and learn.",
  newDiscussion: "Start New Discussion",
  by: "by",
  replies: "replies",
  likes: "likes",
};

const forumThreads = [
  {
    id: "1",
    title: "Best crop rotation practices for Jharkhand soil?",
    author: "Rina Devi",
    avatarUrl: "https://picsum.photos/seed/rina/100/100",
    replies: 12,
    likes: 28,
    tags: ["Crop Rotation", "Jharkhand", "Soil Health"],
    excerpt: "I'm planning my next season and want to improve my soil's nitrogen levels naturally. What are some effective crop rotation strategies you all have used successfully in this region? Looking for advice on pulses.",
  },
  {
    id: "2",
    title: "Dealing with Paddy Stem Borer - Organic Solutions",
    author: "Sanjay Kumar",
    avatarUrl: "https://picsum.photos/seed/sanjay/100/100",
    replies: 8,
    likes: 15,
    tags: ["Pest Control", "Paddy", "Organic"],
    excerpt: "The stem borer has been a persistent issue in my paddy fields. I want to avoid harsh chemicals. Has anyone had luck with neem oil, pheromone traps, or other organic methods?",
  },
  {
    id: "3",
    title: "Weather Alert: Unexpected rainfall predicted for Ranchi district",
    author: "Admin",
    avatarUrl: "https://picsum.photos/seed/admin/100/100",
    replies: 5,
    likes: 45,
    tags: ["Weather", "Ranchi", "Alert"],
    excerpt: "The meteorological department has issued a warning for heavy rainfall over the next 48 hours in the Ranchi district. Farmers are advised to take necessary precautions for their standing crops.",
  },
  {
    id: "4",
    title: "Show off your harvest! (July 2024)",
    author: "Priya Singh",
    avatarUrl: "https://picsum.photos/seed/priya/100/100",
    replies: 25,
    likes: 62,
    tags: ["Harvest", "Community", "Photos"],
    excerpt: "It's been a great month for vegetables! Let's see what everyone has harvested. Post your pictures here - tomatoes, gourds, chilies, anything and everything!",
  },
];


export default function CommunityPage() {

  const { translatedText, T } = useTranslation(originalText);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold"><T textKey="title" /></h1>
          <p className="text-muted-foreground"><T textKey="description" /></p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          <T textKey="newDiscussion" />
        </Button>
      </div>

      <div className="space-y-4">
        {forumThreads.map((thread) => (
          <Card key={thread.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[1fr_80px_80px] gap-4 items-center">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={thread.avatarUrl} alt={thread.author} data-ai-hint="user avatar" />
                  <AvatarFallback>{thread.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/community/${thread.id}`} className="hover:underline">
                    <h3 className="font-bold font-headline leading-tight">{thread.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    <T textKey="by" /> <span className="font-semibold text-primary">{thread.author}</span>
                  </p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                      {thread.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MessageSquare className="size-4" />
                <span className="font-medium">{thread.replies}</span>
                <span className="hidden md:inline"><T textKey="replies" /></span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <ThumbsUp className="size-4" />
                <span className="font-medium">{thread.likes}</span>
                <span className="hidden md:inline"><T textKey="likes" /></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
