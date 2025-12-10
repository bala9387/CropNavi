
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  calculateSustainabilityScore,
} from '@/ai/flows/calculate-sustainability-score';
import {
    CalculateSustainabilityScoreOutput,
} from '@/ai/flows/calculate-sustainability-score.schemas';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Recycle, ShieldCheck, TestTube2, History, ShoppingCart, Tractor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  // Soil Health
  nitrogen: z.coerce.number().min(0, "Must be non-negative"),
  phosphorus: z.coerce.number().min(0, "Must be non-negative"),
  potassium: z.coerce.number().min(0, "Must be non-negative"),
  ph: z.coerce.number().min(0).max(14, "pH must be between 0 and 14"),
  moisture: z.coerce.number().min(0).max(100, "Moisture must be a percentage"),

  // Crop History
  cropRotationData: z.string().min(10, { message: 'Please describe crop rotation.' }),
  
  // Farming Practices
  irrigation: z.string().min(1, "Please select an irrigation method."),
  tillage: z.string().min(1, "Please select a tillage method."),
  pesticides: z.string().min(1, "Please select a pesticide type."),

  // Market & Financial
  marketFinancialData: z.string().min(10, { message: 'Please describe price history and costs.' }),
});

const originalText = {
  title: "Sustainability Score",
  description: "Provide details about your farm to get an AI-calculated sustainability rating.",
  soilHealth: "Soil Health",
  nitrogen: "Nitrogen (kg/ha)",
  phosphorus: "Phosphorus (kg/ha)",
  potassium: "Potassium (kg/ha)",
  ph: "Soil pH",
  moisture: "Moisture (%)",
  farmingPractices: "Farming Practices",
  irrigation: "Irrigation",
  tillage: "Tillage",
  pesticides: "Pesticides",
  cropHistory: "Crop History & Rotation",
  cropHistoryDescription: "Describe your rotation for the last 2-3 seasons.",
  marketFinancial: "Market & Financials",
  marketFinancialDescription: "Describe price trends and your costs.",
  calculateButton: "Calculate Score",
  calculating: "Calculating your score...",
  yourScore: "Your Sustainability Score",
  outOf100: "out of 100",
  rationale: "Rationale & Recommendations",
  placeholder: "Your sustainability score and insights will appear here.",
};

export default function SustainabilityScorePage() {
  const [score, setScore] =
    useState<CalculateSustainabilityScoreOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { translatedText, T, isTranslating } = useTranslation(originalText);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nitrogen: 120,
      phosphorus: 50,
      potassium: 50,
      ph: 6.8,
      moisture: 60,
      cropRotationData: 'Rice during monsoon (June-Oct), followed by Wheat in winter (Nov-Mar), and a fallow period with green manure in summer (Apr-May).',
      irrigation: 'flood',
      tillage: 'conventional',
      pesticides: 'synthetic',
      marketFinancialData: 'Agmarknet shows stable prices for wheat, but rice prices fluctuate. My expenses for last season were roughly 40% of revenue.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setScore(null);

    const structuredInput = {
      soilHealthData: JSON.stringify({
        nitrogen: values.nitrogen,
        phosphorus: values.phosphorus,
        potassium: values.potassium,
        ph: values.ph,
        moisture: values.moisture,
      }),
      cropRotationData: values.cropRotationData,
      marketFinancialData: values.marketFinancialData,
      farmingPractices: JSON.stringify({
        irrigation: values.irrigation,
        tillage: values.tillage,
        pesticides: values.pesticides,
      }),
    };

    try {
      const result = await calculateSustainabilityScore(structuredInput);
      setScore(result);
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate score. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Recycle className="text-primary" />
            <T textKey="title" />
          </CardTitle>
          <CardDescription>
            <T textKey="description" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Soil Health Section */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><TestTube2 className="text-primary/80"/><T textKey="soilHealth" /></h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="nitrogen" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="nitrogen" /></FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 120" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="phosphorus" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="phosphorus" /></FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="potassium" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="potassium" /></FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="ph" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="ph" /></FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 6.8" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="moisture" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="moisture" /></FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Farming Practices Section */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><Tractor className="text-primary/80"/><T textKey="farmingPractices" /></h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="irrigation" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="irrigation" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="drip">Drip</SelectItem>
                            <SelectItem value="sprinkler">Sprinkler</SelectItem>
                            <SelectItem value="flood">Flood</SelectItem>
                            <SelectItem value="rainfed">Rain-fed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="tillage" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="tillage" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="no-till">No-Till</SelectItem>
                            <SelectItem value="minimum-till">Minimum-Till</SelectItem>
                            <SelectItem value="conventional">Conventional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="pesticides" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="pesticides" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                          <SelectContent>
                             <SelectItem value="organic">Organic</SelectItem>
                             <SelectItem value="integrated">Integrated Pest Management (IPM)</SelectItem>
                             <SelectItem value="synthetic">Synthetic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>
              </div>

              {/* Crop History Section */}
              <div className="space-y-4">
                 <h3 className="font-headline text-lg flex items-center gap-2"><History className="text-primary/80"/><T textKey="cropHistory" /></h3>
                 <FormField control={form.control} name="cropRotationData" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="cropHistoryDescription" /></FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., '2023: Rice -> Wheat. 2022: Maize -> Lentils. 2021: Sugarcane.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               {/* Market & Financial Section */}
              <div className="space-y-4">
                 <h3 className="font-headline text-lg flex items-center gap-2"><ShoppingCart className="text-primary/80"/><T textKey="marketFinancial" /></h3>
                 <FormField control={form.control} name="marketFinancialData" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="marketFinancialDescription" /></FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Market prices for my crops are stable. My expenses are about 50% of my revenue.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading || isTranslating} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                <T textKey="calculateButton" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:sticky top-6">
        {isLoading && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                <T textKey="calculating" />
              </p>
            </CardContent>
          </Card>
        )}
        {score && (
          <Card className="animate-in fade-in-50">
            <CardHeader className="items-center text-center">
              <CardTitle className="font-headline text-2xl">
                <T textKey="yourScore" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-7xl font-bold font-headline text-primary">
                  {score.sustainabilityScore}
                </p>
                <p className="text-muted-foreground"><T textKey="outOf100" /></p>
                <Progress value={score.sustainabilityScore} className="mt-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg font-headline">
                  <T textKey="rationale" />
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {score.rationale}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {!isLoading && !score && (
          <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                <T textKey="placeholder" />
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
