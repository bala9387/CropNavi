'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { MessageSchema } from '@/ai/flows/ai-chat.schemas';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useTranslation, useLanguage } from '@/hooks/use-translation';

const originalText = {
    chatWithAI: "Chat with AI",
    assistantName: "CropNavi Assistant",
    online: "Online",
    initialMessage: "Hello! I'm the CropNavi Assistant. How can I help you today?",
    placeholder: "Ask a question...",
};

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<z.infer<typeof MessageSchema>[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const { translatedText, T } = useTranslation(originalText);
    const { selectedLang } = useLanguage();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Reset messages when chat opens or language changes
        if (isOpen) {
            setMessages([
                { role: 'model', content: translatedText.initialMessage }
            ]);
        }
    }, [isOpen, selectedLang, translatedText.initialMessage]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: z.infer<typeof MessageSchema> = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages;
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ history, prompt: input, language: selectedLang }),
            });

            if (!response.ok) {
                throw new Error('API error');
            }

            const result = await response.json();

            const modelMessage: z.infer<typeof MessageSchema> = { role: 'model', content: result.response };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("AI Chat Error:", error);
            toast({
                variant: 'destructive',
                title: 'AI Chat Error',
                description: 'Sorry, I had trouble getting a response. Please try again.',
            });
            // Revert to previous state on error
            setMessages(messages);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? "scale-0" : "scale-100")}>
                <Button size="lg" className="rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
                    <MessageCircle className="mr-2" />
                    <T textKey="chatWithAI" />
                </Button>
            </div>

            <Card className={cn(
                "fixed bottom-6 right-6 z-50 w-full max-w-sm flex flex-col h-[70vh] max-h-[600px] transition-transform duration-300 origin-bottom-right",
                !isOpen && "scale-0"
            )}>
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-lg"><T textKey="assistantName" /></CardTitle>
                            <CardDescription className="flex items-center gap-1.5 text-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <T textKey="online" />
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                        <div className="p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {message.role === 'user' ? <User className="size-5" /> : <Bot className="size-5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn("rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap",
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-3 py-2 bg-muted text-muted-foreground">
                                        <Loader2 className="size-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={translatedText.placeholder}
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </>
    );
}
