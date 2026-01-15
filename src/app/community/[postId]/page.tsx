
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
  title: "Best drip irrigation setup for Coimbatore black soil?",
  author: "Ramesh Kumar",
  avatarUrl: "https://picsum.photos/seed/ramesh/100/100",
  timestamp: "2 days ago",
  tags: ["Irrigation", "Coimbatore", "Black Soil"],
  likes: 32,
  content: "I'm looking to install a new drip system for my cotton field near Pollachi. Given the heavy black soil here, what spacing and emitter flow rates do you recommend to avoid waterlogging? \n\nI have previously used flood irrigation but water scarcity is becoming an issue. My soil has high clay content. Any specific brands or configurations that work well in our region? Also, purely regarding maintenance, how often do you flush the laterals?",
  replies: [
    {
      id: "r1",
      author: "Senthil Nathan",
      avatarUrl: "https://picsum.photos/seed/senthil/100/100",
      timestamp: "2 days ago",
      content: "Great decision, Ramesh! For black soil in Pollachi, I recommend 16mm laterals with 40cm spacing. Since clay holds water, use lower flow emitters (2 LPH) to give it time to seep in without pooling. This prevents root rot.",
      likes: 15,
    },
    {
      id: "r2",
      author: "Lakshmi Priya",
      avatarUrl: "https://picsum.photos/seed/lakshmi/100/100",
      timestamp: "1 day ago",
      content: "I agree with Senthil. Also, check with the local Horticulture department in Coimbatore. There is a 75% subsidy scheme active right now for small farmers installing micro-irrigation. Don't miss that!",
      likes: 28,
    },
    {
      id: "r3",
      author: "Admin",
      avatarUrl: "https://picsum.photos/seed/admin/100/100",
      timestamp: "1 day ago",
      content: "Excellent discussion. TNAU (Tamil Nadu Agricultural University) has a specific guide for 'Drip fertigation in Cotton for Black Soils'. You can visit the university extension center or check our Education module. [Link to TNAU Guide]",
      likes: 42,
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
              <ThumbsUp className="mr-2" /> {postData.likes} <T textKey="like" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="mr-2" /> <T textKey="replies" />
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
                    <ThumbsUp className="mr-1.5 size-3.5" /> {reply.likes}
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
          <Textarea placeholder={translatedText.writeReply} className="min-h-[120px]" />
        </CardContent>
        <CardFooter>
          <Button><T textKey="submitReply" /></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

