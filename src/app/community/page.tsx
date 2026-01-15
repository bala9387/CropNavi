'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare, ThumbsUp, PlusCircle, Search, Filter,
  TrendingUp, Users, Award, MoreVertical, Share2, CornerDownRight
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Types ---
interface ForumThread {
  id: string;
  title: string;
  author: string;
  avatarUrl: string;
  replies: number;
  likes: number;
  tags: string[];
  excerpt: string;
  timestamp: string;
  isLiked?: boolean;
}

// --- Initial Data (Coimbatore Context) ---
const initialThreads: ForumThread[] = [
  {
    id: "1",
    title: "Best drip irrigation setup for Coimbatore black soil?",
    author: "Ramesh Kumar",
    avatarUrl: "https://picsum.photos/seed/ramesh/100/100",
    replies: 14,
    likes: 32,
    tags: ["Irrigation", "Coimbatore", "Black Soil"],
    excerpt: "I'm looking to install a new drip system for my cotton field near Pollachi. Given the heavy black soil here, what spacing and emitter flow rates do you recommend to avoid waterlogging?",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    title: "Controlling Red Palm Weevil in Coconut trees - Urgent",
    author: "Senthil Nathan",
    avatarUrl: "https://picsum.photos/seed/senthil/100/100",
    replies: 28,
    likes: 45,
    tags: ["Pest Control", "Coconut", "Organic"],
    excerpt: "I've spotted signs of Red Palm Weevil in my young coconut grove. I want to avoid harsh chemicals if possible. Has anyone in the region had success with pheromone traps acting as a preventive measure?",
    timestamp: "5 hours ago"
  },
  {
    id: "3",
    title: "Market Alert: Turmeric prices rising in Erode/Coimbatore",
    author: "Admin",
    avatarUrl: "https://picsum.photos/seed/admin/100/100",
    replies: 12,
    likes: 89,
    tags: ["Market Price", "Turmeric", "News"],
    excerpt: "Traders are reporting a surge in demand for high-curcumin turmeric. Prices at the regulated market have seen a 15% hike this week. Farmers holding stock might want to monitor this trend.",
    timestamp: "1 day ago"
  },
  {
    id: "4",
    title: "Success Story: Intercropping Cocoa with Coconut",
    author: "Lakshmi Priya",
    avatarUrl: "https://picsum.photos/seed/lakshmi/100/100",
    replies: 34,
    likes: 120,
    tags: ["Intercropping", "Success Story", "Cocoa"],
    excerpt: "Just harvested my first batch of Cocoa pods from my intercropped coconut farm! It's been a great way to utilize the shade. Sharing some photos and tips for anyone interested in trying this.",
    timestamp: "2 days ago"
  },
];

const trendingTags = ["Coconut", "Irrigation", "Organic", "Market Price", "Coimbatore", "Pollen", "Subsidy"];

const originalText = {
  title: "Community Forum",
  description: "Connect with farmers, share expertise, and grow together.",
  newDiscussion: "Start New Discussion",
  searchPlaceholder: "Search discussions...",
  trendingTopics: "Trending Topics",
  communityStats: "Community Stats",
  activeFarmers: "Active Farmers",
  dailyPosts: "Daily Posts",
  solvedQueries: "Solved Queries",
  by: "by",
  replies: "replies",
  likes: "likes",
  createPost: "Create Post",
  postTitle: "Title",
  postContent: "Content",
  postTags: "Tags (comma separated)",
  cancel: "Cancel",
  submit: "Post Discussion",
  successTitle: "Discussion Posted",
  successDesc: "Your topic is now live in the community.",
  like: "Like",
  reply: "Reply",
  share: "Share"
};

export default function CommunityPage() {
  const { translatedText, T } = useTranslation(originalText);
  const { toast } = useToast();

  const [threads, setThreads] = useState<ForumThread[]>(initialThreads);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  const handleCreatePost = () => {
    if (!newTitle || !newContent) return;

    const newThread: ForumThread = {
      id: Date.now().toString(),
      title: newTitle,
      author: "You (Farmer)", // In a real app, this would be the logged-in user
      avatarUrl: "https://picsum.photos/seed/you/100/100",
      replies: 0,
      likes: 0,
      tags: newTags.split(',').map(t => t.trim()).filter(t => t),
      excerpt: newContent.length > 150 ? newContent.substring(0, 150) + "..." : newContent,
      timestamp: "Just now"
    };

    setThreads([newThread, ...threads]);
    setIsDialogOpen(false);
    setNewTitle("");
    setNewContent("");
    setNewTags("");

    toast({
      title: translatedText.successTitle,
      description: translatedText.successDesc,
    });
  };

  const handleLike = (id: string) => {
    setThreads(threads.map(t => {
      if (t.id === id) {
        return { ...t, likes: t.isLiked ? t.likes - 1 : t.likes + 1, isLiked: !t.isLiked };
      }
      return t;
    }));
  };

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    t.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto space-y-8 pb-12">

      {/* --- Header Section --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-900 to-emerald-800 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight mb-2"><T textKey="title" /></h1>
            <p className="text-emerald-100 text-lg md:text-xl font-light opacity-90"><T textKey="description" /></p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-lg transition-all hover:scale-105 rounded-full px-8 py-6 text-lg group">
                <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                <T textKey="newDiscussion" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-headline"><T textKey="createPost" /></DialogTitle>
                <DialogDescription>
                  Share your knowledge or ask a question to the community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="font-semibold"><T textKey="postTitle" /></Label>
                  <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Best fertilizer for Tomato?" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags" className="font-semibold"><T textKey="postTags" /></Label>
                  <Input id="tags" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="e.g., Organic, Tomato, Summer" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content" className="font-semibold"><T textKey="postContent" /></Label>
                  <Textarea id="content" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Describe your question or insight in detail..." className="min-h-[150px] rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl"><T textKey="cancel" /></Button>
                <Button onClick={handleCreatePost} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"><T textKey="submit" /></Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- Main Feed (8 cols) --- */}
        <div className="lg:col-span-8 space-y-6">

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
            </div>
            <Input
              className="pl-12 h-14 rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-lg transition-all"
              placeholder={translatedText.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredThreads.map((thread) => (
              <Card key={thread.id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm hover:bg-white ring-1 ring-black/5">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Vote/Stats Sidebar */}
                    <div className="hidden md:flex flex-col items-center justify-center gap-1 p-4 bg-gray-50/50 border-r border-gray-100 min-w-[80px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("flex flex-col gap-1 h-auto py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600", thread.isLiked && "text-emerald-600 bg-emerald-50")}
                        onClick={(e) => { e.preventDefault(); handleLike(thread.id); }}
                      >
                        <ThumbsUp className={cn("h-6 w-6", thread.isLiked && "fill-emerald-600")} />
                        <span className="font-bold text-sm">{thread.likes}</span>
                      </Button>
                      <div className="h-px w-8 bg-gray-200 my-2"></div>
                      <Button variant="ghost" size="sm" className="flex flex-col gap-1 h-auto py-2 rounded-xl text-gray-400 cursor-default hover:bg-transparent">
                        <MessageSquare className="h-6 w-6" />
                        <span className="font-bold text-sm">{thread.replies}</span>
                      </Button>
                    </div>

                    {/* Content */}
                    <Link href={`/community/${thread.id}`} className="flex-1 p-5 md:p-6 block">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={thread.avatarUrl} alt={thread.author} />
                          <AvatarFallback>{thread.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{thread.author}</span>
                          <span className="text-gray-400 mx-1">•</span>
                          <span className="text-gray-500">{thread.timestamp}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold font-headline text-gray-900 group-hover:text-emerald-700 transition-colors mb-2 leading-tight">
                        {thread.title}
                      </h3>

                      <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {thread.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        {thread.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 px-3 py-1 rounded-lg">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  </div>

                  {/* Mobile Actions Footer */}
                  <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-4">
                      <div onClick={() => handleLike(thread.id)} className="flex items-center gap-1.5 text-gray-500 active:text-emerald-600">
                        <ThumbsUp className={cn("h-4 w-4", thread.isLiked && "fill-emerald-600 text-emerald-600")} /> <span>{thread.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MessageSquare className="h-4 w-4" /> <span>{thread.replies}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{thread.timestamp}</div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredThreads.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">No discussions found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms or start a new discussion.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Right Sidebar (4 cols) --- */}
        <div className="hidden lg:block col-span-4 space-y-6">

          {/* Community Stats Widget */}
          <Card className="rounded-2xl border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> <T textKey="communityStats" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-black text-blue-600">1.2k</div>
                <div className="text-xs font-medium text-blue-400 uppercase tracking-wide"><T textKey="activeFarmers" /></div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-black text-green-600">45</div>
                <div className="text-xs font-medium text-green-400 uppercase tracking-wide"><T textKey="dailyPosts" /></div>
              </div>
              <div className="col-span-2 text-center p-3 bg-purple-50 rounded-xl flex items-center justify-between px-6">
                <div className="text-left">
                  <div className="text-2xl font-black text-purple-600">98%</div>
                  <div className="text-xs font-medium text-purple-400 uppercase tracking-wide"><T textKey="solvedQueries" /></div>
                </div>
                <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics Widget */}
          <Card className="rounded-2xl border-0 shadow-lg bg-white">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" /> <T textKey="trendingTopics" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, i) => (
                  <div key={i} className="flex items-center justify-between w-full group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono text-sm">#{i + 1}</span>
                      <span className="font-medium text-gray-700 group-hover:text-pink-600 transition-colors">{tag}</span>
                    </div>
                    <CornerDownRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Banner/Ad Area (Mock) */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">TNAU Farming Workshop</h3>
            <p className="text-indigo-100 text-sm mb-4 relative z-10">Join the upcoming workshop on organic farming techniques efficiently.</p>
            <Button variant="secondary" size="sm" className="w-full relative z-10 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">Register Now</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
