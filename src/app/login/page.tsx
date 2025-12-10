
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useLanguage, useTranslation } from "@/hooks/use-translation";

const GoogleIcon = () => (
    <svg className="size-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.36,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

const FacebookIcon = () => (
    <svg className="size-5" viewBox="0 0 24 24">
        <path fill="#1877F2" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.32 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
    </svg>
);

const InstagramIcon = () => (
    <svg className="size-5" viewBox="0 0 24 24">
         <defs>
            <radialGradient id="ig-gradient" cx="0.3" cy="1.2" r="1.2">
                <stop offset="0" stopColor="#F58529" />
                <stop offset="0.4" stopColor="#DD2A7B" />
                <stop offset="0.9" stopColor="#8134AF" />
            </radialGradient>
        </defs>
        <path fill="url(#ig-gradient)" d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
    </svg>
);

const XIcon = () => (
    <svg className="size-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const originalText = {
  backToGetStarted: 'Back to Get Started',
  welcome: 'Welcome to CropNavi',
  signInContinue: 'Sign in to continue to your dashboard.',
  orContinueWith: 'Or continue with',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  forgotPassword: 'Forgot your password?',
  signInButton: 'Sign In',
  noAccount: "Don't have an account?",
  signUp: 'Sign up',
  termsAgreement: "By continuing, you agree to CropNavi's",
  terms: 'Terms of Service',
  and: 'and',
  privacy: 'Privacy Policy',
};

function LoginPageContent() {
  const { selectedLang } = useLanguage();
  const { T, isTranslating } = useTranslation(originalText);

  return (
    <div className="flex items-center justify-center min-h-full px-4 py-12 bg-background relative">
       <Button variant="ghost" asChild className="absolute top-4 left-4">
          <Link href={`/?lang=${selectedLang || 'en'}`}>
            <ArrowLeft className="mr-2" />
            <T textKey="backToGetStarted" />
          </Link>
        </Button>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Sprout className="mx-auto size-10 text-primary" />
            <CardTitle className="font-headline mt-4 text-2xl">
              <T textKey="welcome" />
            </CardTitle>
            <CardDescription>
              <T textKey="signInContinue" />
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="w-full">
                    <GoogleIcon />
                    <span className="sr-only">Sign in with Google</span>
                </Button>
                <Button variant="outline" className="w-full">
                    <FacebookIcon />
                    <span className="sr-only">Sign in with Facebook</span>
                </Button>
                 <Button variant="outline" className="w-full">
                    <InstagramIcon />
                    <span className="sr-only">Sign in with Instagram</span>
                </Button>
                 <Button variant="outline" className="w-full">
                    <XIcon />
                    <span className="sr-only">Sign in with X</span>
                </Button>
            </div>
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      <T textKey="orContinueWith" />
                    </span>
                </div>
            </div>
            {isTranslating ? (
              <div className="space-y-6 pt-2">
                <div className="space-y-2">
                  <div className="h-5 w-12 bg-muted rounded-md animate-pulse"></div>
                  <div className="w-full h-10 bg-muted rounded-md animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-16 bg-muted rounded-md animate-pulse"></div>
                  <div className="w-full h-10 bg-muted rounded-md animate-pulse"></div>
                </div>
              </div>
            ): (
              <>
               <div className="space-y-2">
                  <Label htmlFor="email"><T textKey="emailLabel" /></Label>
                  <Input id="email" type="email" placeholder="farmer@example.com" required />
              </div>
               <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password"><T textKey="passwordLabel" /></Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-xs underline"
                    >
                      <T textKey="forgotPassword" />
                    </Link>
                  </div>
                  <Input id="password" type="password" required />
              </div>
              </>
            )}
            <Button className="w-full" asChild>
                <Link href="/dashboard">
                    {isTranslating ? <Loader2 className="animate-spin" /> : <T textKey="signInButton" />}
                </Link>
            </Button>
           <div className="mt-4 text-center text-sm">
              <T textKey="noAccount" />{' '}
              <Link href="#" className="underline">
                <T textKey="signUp" />
              </Link>
            </div>
        </CardContent>
         <CardFooter className="flex-col gap-2 text-center">
           <p className="text-xs text-muted-foreground">
            <T textKey="termsAgreement" />{' '}
            <Link href="#" className="underline hover:text-primary">
              <T textKey="terms" />
            </Link>
            {' '}<T textKey="and" />{' '}
            <Link href="#" className="underline hover:text-primary">
              <T textKey="privacy" />
            </Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <LoginPageContent />
        </Suspense>
    )
}
