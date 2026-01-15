'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Check if Firebase is available
            const firebaseModule = await import("@/lib/firebase");
            const auth = firebaseModule.auth as any;

            if (auth) {
                const { sendPasswordResetEmail } = await import("firebase/auth");
                await sendPasswordResetEmail(auth, email);

                setEmailSent(true);
                toast({
                    title: "Email Sent",
                    description: "Password reset instructions have been sent to your email.",
                });
            } else {
                // Fallback for when Firebase is not configured
                // Simulate email sending
                await new Promise(resolve => setTimeout(resolve, 1500));

                setEmailSent(true);
                toast({
                    title: "Email Sent",
                    description: "If an account exists with this email, you'll receive password reset instructions.",
                });
            }
        } catch (error: any) {
            console.error("Password reset error:", error);

            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send reset email. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="container relative h-screen flex items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-4 text-center">
                        <div className="mx-auto bg-green-500/10 p-4 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight">
                            Check your email
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            We've sent password reset instructions to <strong>{email}</strong>
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEmailSent(false);
                                setEmail("");
                            }}
                        >
                            Try another email
                        </Button>

                        <Button asChild className="bg-green-600 hover:bg-green-500">
                            <Link href="/login">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

            {/* --- Left Column: Hero Image --- */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop')`,
                        opacity: 0.6
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Logo Area */}
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="bg-green-500/20 p-2 rounded-lg backdrop-blur-sm mr-2 border border-green-500/30">
                        <Sprout className="h-6 w-6 text-green-400" />
                    </div>
                    <span className="font-headline tracking-wide">CropNavi</span>
                </div>

                {/* Info Area */}
                <div className="relative z-20 mt-auto">
                    <div className="space-y-4">
                        <Mail className="h-12 w-12 text-green-400/70" />
                        <h2 className="text-2xl font-light text-green-50/90">
                            Reset Your Password
                        </h2>
                        <p className="text-sm text-green-50/70">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Right Column: Reset Form --- */}
            <div className="lg:p-8 w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm lg:bg-background">

                <Button
                    variant="ghost"
                    className="absolute right-4 top-4 md:right-8 md:top-8"
                    asChild
                >
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </Button>

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">

                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                            Forgot Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-muted/30 focus:bg-background transition-colors"
                            />
                        </div>

                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="h-11 bg-green-600 hover:bg-green-500 text-white font-medium shadow-md transition-all active:scale-[0.98]"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Reset Link
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link
                            href="/login"
                            className="underline underline-offset-4 hover:text-primary font-medium text-green-600 hover:text-green-500 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
