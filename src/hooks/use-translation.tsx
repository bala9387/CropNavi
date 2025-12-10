
'use client';

import { useState, useEffect, useCallback, createContext, useContext, forwardRef, ReactNode, useMemo } from 'react';
import { translatePageContent } from '@/ai/flows/translate-page-content';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { languages } from '@/lib/languages';

export { languages };


type TranslationContextType = {
    selectedLang: string;
    handleLanguageChange: (lang: string) => void;
    isTranslating: boolean;
    languages: typeof languages;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const initialLang = searchParams.get('lang') || 'en';
    
    const [selectedLang, setSelectedLang] = useState(initialLang);
    const [isTranslating, setIsTranslating] = useState(false);
    
    const handleLanguageChange = (lang: string) => {
        setIsTranslating(true);
        setSelectedLang(lang);
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('lang', lang);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
        //setIsTranslating(false); // This will be set by individual hooks
    };
    
    useEffect(() => {
        const langFromParams = searchParams.get('lang') || 'en';
        if (langFromParams !== selectedLang) {
            setSelectedLang(langFromParams);
        }
    }, [searchParams, selectedLang]);

    const value = {
        selectedLang,
        handleLanguageChange,
        isTranslating,
        languages,
    };

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useLanguage must be used within a TranslationProvider');
    }
    return context;
}

export function useTranslation<T extends Record<string, string>>(originalText: T) {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    const { selectedLang } = context;

    const [translatedText, setTranslatedText] = useState(originalText);
    const [isComponentTranslating, setIsComponentTranslating] = useState(false);
    const { toast } = useToast();

    // Memoize originalText to prevent re-renders unless it actually changes
    const stableOriginalText = useMemo(() => originalText, [originalText]);

    useEffect(() => {
        const translate = async () => {
            const language = languages.find(l => l.code === selectedLang);
            
            // Immediately reset to original if English is selected or no language found
            if (!language || selectedLang === 'en') {
                setTranslatedText(stableOriginalText);
                setIsComponentTranslating(false);
                return;
            }

            setIsComponentTranslating(true);
            try {
                const targetLanguage = language.name.split(' ')[0];
                const originalKeys = Object.keys(stableOriginalText) as (keyof T)[];
                const originalValues = Object.values(stableOriginalText);

                const response = await translatePageContent({
                    texts: originalValues,
                    targetLanguage: targetLanguage,
                });

                const newTranslatedText = originalKeys.reduce((acc, key, index) => {
                    acc[key] = response.translations[index] || originalValues[index];
                    return acc;
                }, {} as T);

                setTranslatedText(newTranslatedText);

            } catch (error) {
                console.error("Translation failed:", error);
                toast({
                    title: "Translation Error",
                    description: "Could not translate content.",
                    variant: "destructive",
                });
                setTranslatedText(stableOriginalText); // Fallback to original
            } finally {
                setIsComponentTranslating(false);
            }
        };

        translate();
    }, [selectedLang, stableOriginalText, toast]);

    const T = forwardRef<HTMLSpanElement, { textKey: keyof T } & React.HTMLAttributes<HTMLSpanElement>>((
      { textKey, ...props }, ref
    ) => {
        const text = translatedText[textKey] || stableOriginalText[textKey];
        if (isComponentTranslating) {
            return <span ref={ref} {...props}><Loader2 className="size-4 animate-spin inline-block" /></span>;
        }
        return <span ref={ref} {...props}>{text}</span>;
    });
    T.displayName = "T";

    return {
        translatedText,
        isTranslating: isComponentTranslating,
        T,
    };
}
