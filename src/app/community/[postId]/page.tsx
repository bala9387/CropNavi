
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";

const originalText = {
  back: "Back to Forum",
  postedBy: "Posted by",
  like: "Like",
  replies: "Replies",
  share: "Share",
  postReply: "Post a Reply",
  writeReply: "Write your reply here...",
  submitReply: "Submit Reply",
};

// Mock data - In a real app, you would fetch this based on the postId
const postData = {
  id: "1",
  title: "Best crop rotation practices for Jharkhand soil?",
  author: "Rina Devi",
  avatarUrl: "https://picsum.photos/seed/rina/100/100",
  timestamp: "2 days ago",
  tags: ["Crop Rotation", "Jharkhand", "Soil Health"],
  likes: 28,
  content: "I'm planning my next season and want to improve my soil's nitrogen levels naturally. What are some effective crop rotation strategies you all have used successfully in this region? \n\nI have been doing rice-wheat cycle for a few years, but I feel the yield is slowly decreasing. I have access to good irrigation. I'm thinking of planting some kind of pulse (dal) but not sure which one would be best for the soil here. Any advice would be greatly appreciated!",
  replies: [
    {
      id: "r1",
      author: "Sanjay Kumar",
      avatarUrl: "https://picsum.photos/seed/sanjay/100/100",
      timestamp: "2 days ago",
      content: "Great question, Rina! I switched to a rice-lentil (masoor) rotation and it has worked wonders for my soil. Lentils are great nitrogen fixers. Make sure to use a good quality rhizobium culture when sowing.",
      likes: 5,
    },
    {
      id: "r2",
      author: "Priya Singh",
      avatarUrl: "https://picsum.photos/seed/priya/100/100",
      timestamp: "1 day ago",
      content: "I agree with Sanjay. Another option is Chickpea (chana). It's also a great nitrogen fixer and has a good market price right now. You could also try green manure crops like Dhaincha in the summer fallow period.",
      likes: 8,
    },
    {
      id: "r3",
      author: "Admin",
      avatarUrl: "https://picsum.photos/seed/admin/100/100",
      timestamp: "1 day ago",
      content: "Excellent discussion. For those interested, the state agricultural university has published a guide on crop rotation for Jharkhand. You can find it in our Education section. [Link to guide]",
      likes: 12,
    },
  ],
};


export default function PostPage({ params }: { params: { postId: string } }) {

  // In a real app, you would use params.postId to fetch the correct post.
  // For this prototype, we'll just use the mock data.
  const { translatedText, T } = useTranslation(originalText);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/community">
            <ArrowLeft className="mr-2" />
            <T textKey="back" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage src={postData.avatarUrl} alt={postData.author} data-ai-hint="user avatar" />
                <AvatarFallback>{postData.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-2xl">{postData.title}</CardTitle>
                <CardDescription>
                  <T textKey="postedBy" /> <span className="font-semibold text-primary">{postData.author}</span> &bull; {postData.timestamp}
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-card-foreground/90">{postData.content}</p>
          <div className="mt-6 flex gap-2 flex-wrap">
            {postData.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                    <ThumbsUp className="mr-2"/> {postData.likes} <T textKey="like" />
                </Button>
                <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2"/> <T textKey="replies" />
                </Button>
            </div>
            <Button variant="ghost" size="sm">
                <Share2 className="mr-2" /> <T textKey="share" />
            </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="font-headline text-xl font-bold"><T textKey="replies" /> ({postData.replies.length})</h3>

        {postData.replies.map(reply => (
          <Card key={reply.id} className="bg-muted/30">
            <CardContent className="p-4 flex gap-4">
              <Avatar>
                <AvatarImage src={reply.avatarUrl} alt={reply.author} data-ai-hint="user avatar" />
                <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{reply.author}</p>
                    <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                </div>
                <p className="text-sm mt-1">{reply.content}</p>
                 <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                        <ThumbsUp className="mr-1.5 size-3.5"/> {reply.likes}
                    </Button>
                     <Button variant="ghost" size="sm" className="text-xs h-7">
                        <T textKey="replies" />
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg"><T textKey="postReply" /></CardTitle>
        </CardHeader>
        <CardContent>
            <Textarea placeholder={translatedText.writeReply} className="min-h-[120px]"/>
        </CardContent>
        <CardFooter>
            <Button><T textKey="submitReply" /></Button>
        </CardFooter>
       </Card>
    </div>
  );
}

    