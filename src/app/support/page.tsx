
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent",
            description: "We have received your request and will get back to you shortly.",
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold font-headline text-primary">Help & Support</h1>
                <p className="text-muted-foreground">We are here to help you with any questions or issues.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Us</CardTitle>
                            <CardDescription>Reach out to us directly through these channels.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Phone Support</p>
                                    <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">support@cropnavi.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Office</p>
                                    <p className="text-sm text-muted-foreground">Coimbatore, Tamil Nadu</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="text-lg">FAQ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <details className="cursor-pointer group">
                                <summary className="font-medium text-sm hover:text-primary transition-colors">How do I reset my password?</summary>
                                <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-primary/20">Go to the login page and click 'Forgot password?'. Follow the instructions sent to your email.</p>
                            </details>
                            <details className="cursor-pointer group">
                                <summary className="font-medium text-sm hover:text-primary transition-colors">How to change app language?</summary>
                                <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-primary/20">Click on the globe icon in the top right corner of the header to switch languages.</p>
                            </details>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send a Message</CardTitle>
                        <CardDescription>Fill out the form below and we'll respond within 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="What is this regarding?" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Describe your issue..." className="min-h-[150px]" required />
                            </div>
                            <Button type="submit" className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
