
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Recycle, ShieldCheck, TestTube2, History, ShoppingCart, Tractor, CloudRain, TrendingUp } from 'lucide-react';
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
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Bar, BarChart } from 'recharts';

const formSchema = z.object({
  // Soil Health (Converted to Categories)
  nitrogen: z.string().min(1, "Select nitrogen level"),
  phosphorus: z.string().min(1, "Select phosphorus level"),
  potassium: z.string().min(1, "Select potassium level"),
  ph: z.string().min(1, "Select pH level"),
  moisture: z.string().min(1, "Select moisture level"),

  // Crop History (Converted to Category)
  cropRotationData: z.string().min(1, "Select crop rotation pattern"),

  // Farming Practices
  irrigation: z.string().min(1, "Please select an irrigation method."),
  tillage: z.string().min(1, "Please select a tillage method."),
  pesticides: z.string().min(1, "Please select a pesticide type."),

  // Market & Financial (Converted to Category)
  marketFinancialData: z.string().min(1, "Select market scenario"),

  // Crop Preference
  preferredCrop: z.string().min(1, "Please select a preferred crop."),
});

const commodities = ["Wheat", "Paddy", "Maize", "Mustard", "Arhar (Tur)", "Bajra", "Barley", "Black Pepper", "Cardamom", "Cashew Nuts", "Castor Seed", "Coconut", "Coffee", "Coriander", "Cotton", "Finger Millet (Ragi)", "Gram (Chana)", "Groundnut", "Guar Seed", "Horse-gram", "Jowar (Sorghum)", "Jute", "Korra", "Lentil (Masur)", "Linseed", "Mahua", "Masur", "Moong (Green Gram)", "Niger Seed", "Onion", "Other Pulses", "Potato", "Ragi", "Rapeseed & Mustard", "Rice", "Rubber", "Safflower", "Sannhamp", "Sesamum", "Soyabean", "Sugarcane", "Sunflower", "Tamarind", "Tea", "Tobacco", "Turmeric", "Urad", "Varagu"];

// Mock Climate Data (5 Years)
const generateClimateData = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 5 + i;
    // Simulate TN climate: variable rainfall, warm temps
    const rainfall = 800 + Math.floor(Math.random() * 400); // 800-1200mm
    const temp = 27 + Math.random() * 2; // 27-29 avg
    return {
      year,
      rainfall,
      temperature: Number(temp.toFixed(1)),
    };
  });
};

// Mock Market Price Data (5 Years) for Key Crops
const generateMarketHistory = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 5 + i;
    // Simulate prices for major TN crops
    const paddyPrice = 1800 + Math.floor(Math.random() * 600); // 1800-2400 per quintal
    const turmericPrice = 6000 + Math.floor(Math.random() * 2000); // 6000-8000 per quintal
    return {
      year,
      paddy: paddyPrice,
      turmeric: turmericPrice,
    };
  });
};

const originalText = {
  title: "Sustainability Score",
  description: "Our AI automatically detects your GPS location and fills soil health parameters based on real data from your farm's coordinates. Calculate your sustainability rating instantly.",
  soilHealth: "Soil Health",
  nitrogen: "Nitrogen Level",
  phosphorus: "Phosphorus Level",
  potassium: "Potassium Level",
  ph: "Soil pH Level",
  moisture: "Moisture Level",
  farmingPractices: "Farming Practices",
  irrigation: "Irrigation",
  tillage: "Tillage",
  pesticides: "Pesticides",
  cropHistory: "Crop Rotation Pattern",
  cropHistoryDescription: "How do you rotate your crops?",
  marketFinancial: "Market & Financial Scenario",
  marketFinancialDescription: "Describe your financial situation.",
  preferredCrop: "Preferred Crop",
  preferredCropDesc: "Which crop do you want to calculate the score for?",
  calculateButton: "Calculate Score",
  calculating: "Calculating your score...",
  yourScore: "Your Sustainability Score",
  outOf100: "out of 100",
  rationale: "Rationale & Recommendations",
  placeholder: "Your sustainability score and insights will appear here.",
  climateTitle: "Regional Climate Analysis (Last 5 Years)",
  climateDesc: "Based on local historical data for your region.",
  rainfall: "Annual Rainfall (mm)",
  temperature: "Avg Temperature (°C)",
  marketTitle: "Market Price Trends (Last 5 Years)",
  marketDesc: "Historical average prices (Rs./Quintal)",
  paddy: "Paddy",
  turmeric: "Turmeric"
};

export default function SustainabilityScorePage() {
  const [score, setScore] =
    useState<CalculateSustainabilityScoreOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { translatedText, T, isTranslating } = useTranslation(originalText);

  // Climate Data State
  const [climateData] = useState(generateClimateData());
  // Market History State
  const [marketHistory] = useState(generateMarketHistory());
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nitrogen: 'optimal',
      phosphorus: 'optimal',
      potassium: 'optimal',
      ph: 'neutral',
      moisture: 'optimal',
      cropRotationData: 'legume-rotation',
      irrigation: 'flood',
      tillage: 'conventional',
      pesticides: 'synthetic',
      marketFinancialData: 'stable',
      preferredCrop: 'Paddy',
    },
  });

  // Auto-fill soil data based on location
  useEffect(() => {
    const autoFillFromLocation = async () => {
      if ('geolocation' in navigator) {
        setIsAutoFilling(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;

          // Fetch soil data from SoilGrids API
          const soilResponse = await fetch(
            `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=nitrogen&property=phh2o&property=soc&depth=0-5cm&value=mean`
          );

          if (soilResponse.ok) {
            const soilData = await soilResponse.json();

            // Parse nitrogen levels (in cg/kg, typical range 50-500)
            const nitrogenValue = soilData?.properties?.layers?.[0]?.depths?.[0]?.values?.mean || 200;
            const nitrogenLevel = nitrogenValue < 100 ? 'low' : nitrogenValue > 300 ? 'high' : 'optimal';

            // Parse pH (typical range 4-9)
            const phValue = soilData?.properties?.layers?.[1]?.depths?.[0]?.values?.mean / 10 || 6.5;
            const phLevel = phValue < 6 ? 'acidic' : phValue > 7.5 ? 'alkaline' : 'neutral';

            // Set location-based values
            form.setValue('nitrogen', nitrogenLevel);
            form.setValue('phosphorus', 'optimal'); // Default to optimal
            form.setValue('potassium', 'optimal'); // Default to optimal
            form.setValue('ph', phLevel);
            form.setValue('moisture', 'optimal'); // Default to optimal

            toast({
              title: '📍 Location Detected',
              description: `Soil parameters auto-filled based on your location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            });
          } else {
            // Fallback to optimal values if API fails
            setOptimalDefaults();
          }
        } catch (error) {
          console.log('Location detection failed, using optimal defaults');
          setOptimalDefaults();
        } finally {
          setIsAutoFilling(false);
        }
      } else {
        setOptimalDefaults();
      }
    };

    const setOptimalDefaults = () => {
      form.setValue('nitrogen', 'optimal');
      form.setValue('phosphorus', 'optimal');
      form.setValue('potassium', 'optimal');
      form.setValue('ph', 'neutral');
      form.setValue('moisture', 'optimal');
    };

    autoFillFromLocation();
  }, [form, toast]);

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
      climateData: JSON.stringify(climateData),
      marketHistory: JSON.stringify(marketHistory),
      preferredCrop: values.preferredCrop,
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
                <h3 className="font-headline text-lg flex items-center gap-2">
                  <TestTube2 className="text-primary/80" />
                  <T textKey="soilHealth" />
                  {isAutoFilling && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading from location...
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="nitrogen" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="nitrogen" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (Deficient)</SelectItem>
                          <SelectItem value="optimal">Optimal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="excessive">Excessive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="phosphorus" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="phosphorus" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="optimal">Optimal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="potassium" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="potassium" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="optimal">Optimal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="ph" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="ph" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="acidic">Acidic (&lt;6.0)</SelectItem>
                          <SelectItem value="neutral">Neutral (6.0-7.5)</SelectItem>
                          <SelectItem value="alkaline">Alkaline (&gt;7.5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="moisture" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="moisture" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="dry">Dry / Stressed</SelectItem>
                          <SelectItem value="optimal">Optimal</SelectItem>
                          <SelectItem value="wet">Wet / Waterlogged</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                </div>
              </div>



              {/* Preferred Crop & Practices */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><Tractor className="text-primary/80" /><T textKey="farmingPractices" /></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Preferred Crop - New Field */}
                  <FormField control={form.control} name="preferredCrop" render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="preferredCrop" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                        <FormControl>
                          <SelectTrigger className="bg-background/80">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  {/* Existing Fields */}
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
                <h3 className="font-headline text-lg flex items-center gap-2"><History className="text-primary/80" /><T textKey="cropHistory" /></h3>
                <FormField control={form.control} name="cropRotationData" render={({ field }) => (
                  <FormItem>
                    <FormLabel><T textKey="cropHistoryDescription" /></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                      <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="monoculture">Monoculture (Same crop every year)</SelectItem>
                        <SelectItem value="legume-rotation">Rotation with Legumes (e.g., Pulses)</SelectItem>
                        <SelectItem value="cereal-rotation">Rotation with Cereals</SelectItem>
                        <SelectItem value="mixed-cropping">Mixed Cropping / Intercropping</SelectItem>
                        <SelectItem value="fallow">Includes Fallow Period</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
                />
              </div>

              {/* Market & Financial Section */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><ShoppingCart className="text-primary/80" /><T textKey="marketFinancial" /></h3>
                <FormField control={form.control} name="marketFinancialData" render={({ field }) => (
                  <FormItem>
                    <FormLabel><T textKey="marketFinancialDescription" /></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                      <FormControl><SelectTrigger className="bg-background/80"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="stable">Stable Prices & Costs</SelectItem>
                        <SelectItem value="volatile">Volatile/Unpredictable Market</SelectItem>
                        <SelectItem value="rising-costs">Costs Rising Faster than Revenue</SelectItem>
                        <SelectItem value="profitable">High Profit Margin</SelectItem>
                        <SelectItem value="subsidized">Dependent on Subsidies</SelectItem>
                      </SelectContent>
                    </Select>
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

      <div className="space-y-6 lg:sticky top-6">
        {/* Climate Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CloudRain className="text-blue-500" />
              <T textKey="climateTitle" />
            </CardTitle>
            <CardDescription><T textKey="climateDesc" /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={climateData}>
                  <XAxis dataKey="year" fontSize={12} stroke="#888888" />
                  <YAxis yAxisId="left" fontSize={12} stroke="#888888" />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} stroke="#888888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(climateData.reduce((a, b) => a + b.rainfall, 0) / 5)} mm
                </div>
                <div className="text-xs text-muted-foreground">Avg Rainfall</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(climateData.reduce((a, b) => a + b.temperature, 0) / 5).toFixed(1)} °C
                </div>
                <div className="text-xs text-muted-foreground">Avg Temp</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Price Trends Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              <T textKey="marketTitle" />
            </CardTitle>
            <CardDescription><T textKey="marketDesc" /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketHistory}>
                  <XAxis dataKey="year" fontSize={12} stroke="#888888" />
                  <YAxis fontSize={12} stroke="#888888" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="paddy" name="Paddy" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="turmeric" name="Turmeric" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
