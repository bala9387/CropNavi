
'use client';

import { useState, useEffect, type ComponentProps, useCallback, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  aiCropRecommendationFromPrompt,
} from '@/ai/flows/ai-crop-recommendation-from-prompt';
import {
    AICropRecommendationFromPromptOutput,
} from '@/ai/flows/ai-crop-recommendation-from-prompt.schemas';
import { useTranslation } from '@/hooks/use-translation';
import dynamic from 'next/dynamic';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Sprout, Wand2, MapPin, TestTube2, Map, Crosshair, Tractor, Globe, CloudSun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SoilDataTable } from './soil-data-table';

const InteractiveMap = dynamic(() => import('./interactive-map').then(mod => mod.InteractiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted"><Loader2 className="animate-spin"/></div>
});

const formSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  rainfall: z.string().min(1, "Please select the annual rainfall."),
  soilType: z.string().min(1, "Please select the primary soil type."),
  primaryGoal: z.string().min(1, "Please select your primary farming goal."),
  riskTolerance: z.string().min(1, "Please select your risk tolerance."),
  fieldSize: z.coerce.number().min(0, "Field size must be a positive number."),
  totalBudget: z.coerce.number().min(0, "Budget must be non-negative").optional(),
  recentCrop: z.string().min(1, "Please select the most recent crop."),
  recentCropYear: z.string().min(1, "Please select the year."),
  fertilizer: z.string().min(1, "Please select your fertilizer preference."),
  irrigation: z.string().min(1, "Please select your irrigation method."),
});

const commodities = ["Wheat", "Paddy", "Maize", "Mustard", "Arhar (Tur)", "Bajra", "Barley", "Black Pepper", "Cardamom", "Cashew Nuts", "Castor Seed", "Coconut", "Coffee", "Coriander", "Cotton", "Finger Millet (Ragi)", "Gram (Chana)", "Groundnut", "Guar Seed", "Horse-gram", "Jowar (Sorghum)", "Jute", "Korra", "Lentil (Masur)", "Linseed", "Mahua", "Masur", "Moong (Green Gram)", "Niger Seed", "Onion", "Other Pulses", "Potato", "Ragi", "Rapeseed & Mustard", "Rice", "Rubber", "Safflower", "Sannhamp", "Sesamum", "Soyabean", "Sugarcane", "Sunflower", "Tamarind", "Tea", "Tobacco", "Turmeric", "Urad", "Varagu"];

const originalText = {
  title: 'AI Crop Recommendation',
  description: 'Enter coordinates manually or use your GPS to fetch soil data. Then, describe your farm, and our AI will suggest the best crops for you.',
  locationLabel: '1. Location for Soil Analysis',
  latitudePlaceholder: 'Latitude (e.g., 23.610)',
  longitudePlaceholder: 'Longitude (e.g., 85.279)',
  fetchCoordsButton: 'Fetch Data for Coordinates',
  detectLocationButton: 'Detect My Location & Fetch Data',
  locationDescription: 'The AI will use fetched soil and weather data for recommendations.',
  farmDetailsLabel: '2. Farm & Climate Details',
  annualRainfallLabel: 'Annual Rainfall',
  soilTypeLabel: 'Primary Soil Type',
  primaryGoalLabel: 'Primary Goal',
  riskToleranceLabel: 'Risk Tolerance',
  fieldSizeLabel: 'Field Size (acres)',
  fieldSizePlaceholder: 'e.g., 5',
  totalBudgetLabel: 'Total Budget (₹)',
  totalBudgetPlaceholder: 'e.g., 50000',
  fertilizerPrefLabel: 'Fertilizer Preference',
  irrigationMethodLabel: 'Irrigation Method',
  cropHistoryLabel: 'Crop History',
  recentCropLabel: 'Most Recent Crop',
  harvestYearLabel: 'Harvest Year',
  cropHistoryDescription: 'What was the most recent crop grown on this field?',
  recommendButton: 'Recommend Crops',
  resultTitle: 'AI-Powered Recommendations',
  resultDescription: 'Based on your input, here are our top suggestions.',
  soilDialogTitle: 'SoilGrids Data Preview',
  soilDialogDescription: 'This is the scientific soil data fetched from SoilGrids.org for your location. Review the data and visual maps. Click \'Use This Data\' when done.',
  tableTab: 'Table Data',
  mapsTab: 'Interactive Map',
  rawTab: 'Raw Data',
  googleMapsButton: 'View on Google Maps',
  useDataButton: 'Use This Data',
  cancelButton: 'Cancel',
  placeholderDescription: 'Our AI is analyzing your farm data...',
  recommendedCropsLabel: 'Recommended Crops',
  reasoningLabel: 'Reasoning',
  placeholderTitle: 'Your Recommendations Await',
  dataSummaryTitle: 'Soil & Weather Summary',
};

const dummySoilData = [
    { "name": "bdod", "depths": [{ "label": "0-5cm", "values": { "mean": 136 } }, { "label": "5-15cm", "values": { "mean": 142 } }] },
    { "name": "cec", "depths": [{ "label": "0-5cm", "values": { "mean": 182 } }, { "label": "5-15cm", "values": { "mean": 195 } }] },
    { "name": "clay", "depths": [{ "label": "0-5cm", "values": { "mean": 225 } }, { "label": "5-15cm", "values": { "mean": 240 } }] },
    { "name": "nitrogen", "depths": [{ "label": "0-5cm", "values": { "mean": 115 } }, { "label": "5-15cm", "values": { "mean": 105 } }] },
    { "name": "phh2o", "depths": [{ "label": "0-5cm", "values": { "mean": 68 } }, { "label": "5-15cm", "values": { "mean": 69 } }] },
    { "name": "sand", "depths": [{ "label": "0-5cm", "values": { "mean": 450 } }, { "label": "5-15cm", "values": { "mean": 430 } }] },
    { "name": "silt", "depths": [{ "label": "0-5cm", "values": { "mean": 325 } }, { "label": "5-15cm", "values": { "mean": 330 } }] },
    { "name": "soc", "depths": [{ "label": "0-5cm", "values": { "mean": 125 } }, { "label": "5-15cm", "values": { "mean": 110 } }] }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export default function CropRecommendationPage() {
  const [recommendation, setRecommendation] =
    useState<AICropRecommendationFromPromptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSoilDataDialogOpen, setIsSoilDataDialogOpen] = useState(false);
  const [soilData, setSoilData] = useState<any | null>(null);
  const { toast } = useToast();
  const { translatedText, T, isTranslating } = useTranslation(originalText);
  
  const [dummyLocations, setDummyLocations] = useState([
    { lat: 23.35, lng: 85.32, name: 'Sample Farm A' },
    { lat: 23.33, lng: 85.30, name: 'Sample Farm B' },
    { lat: 23.34, lng: 85.29, name: 'Local Market' },
  ]);
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setIsMounted(true);
    form.reset({
      latitude: 23.3441,
      longitude: 85.3096,
      rainfall: '500-1000mm',
      soilType: 'loam',
      primaryGoal: 'mixed',
      riskTolerance: 'medium',
      fieldSize: 5,
      totalBudget: 50000,
      recentCrop: 'Rice',
      fertilizer: 'mixed',
      irrigation: 'flood',
      recentCropYear: new Date().getFullYear().toString(),
    });
  }, [form]);


  const watchLatitude = form.watch('latitude');
  const watchLongitude = form.watch('longitude');


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      let prompt = `My farm's annual rainfall is ${values.rainfall}. The soil type is primarily ${values.soilType}. My primary goal for farming is ${values.primaryGoal}. I have a ${values.riskTolerance} tolerance for risk. My field size is ${values.fieldSize} acres. I prefer to use ${values.fertilizer} fertilizer. My irrigation method is ${values.irrigation}. The most recent crop I harvested was ${values.recentCrop} in the year ${values.recentCropYear}.`;

      if (values.latitude && values.longitude) {
        prompt += ` My farm is located at latitude ${values.latitude} and longitude ${values.longitude}.`
      }
      if (values.totalBudget) {
        prompt += ` My total budget is ₹${values.totalBudget}.`;
      }

      const result = await aiCropRecommendationFromPrompt({prompt});
      setRecommendation(result);
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to get crop recommendation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const fetchSoilData = useCallback(async (latitude: number, longitude: number) => {
    setIsFetchingLocation(true);
    setSoilData(dummySoilData);
    setIsSoilDataDialogOpen(true);

    form.setValue('latitude', latitude, { shouldValidate: true });
    form.setValue('longitude', longitude, { shouldValidate: true });

    toast({
        title: 'Using Sample Soil Data',
        description: 'Review the sample soil data and click "Use This Data" to continue.',
    });
    setIsFetchingLocation(false);
  }, [form, toast]);

  const handleManualFetch = useCallback(() => {
    const lat = form.getValues('latitude');
    const lon = form.getValues('longitude');
    if (lat !== undefined && lon !== undefined) {
      fetchSoilData(lat, lon);
    } else {
        toast({
            title: 'Missing Coordinates',
            description: 'Please enter both latitude and longitude.',
            variant: 'destructive',
        });
    }
  }, [form, toast, fetchSoilData]);

  const handleLocationFetch = useCallback(() => {
    setIsFetchingLocation(true);
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      setIsFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchSoilData(latitude, longitude);
      },
      (error) => {
        console.error('Error fetching location:', error);
        toast({
          title: 'Location Error',
          description: 'Could not fetch your location. Please ensure you have granted permission.',
          variant: 'destructive',
        });
        setIsFetchingLocation(false);
      }
    );
  }, [toast, fetchSoilData]);

  const handleMapClick = (lat: number, lon: number) => {
    form.setValue('latitude', parseFloat(lat.toFixed(5)), { shouldValidate: true });
    form.setValue('longitude', parseFloat(lon.toFixed(5)), { shouldValidate: true });
    toast({
      title: 'Location Updated',
      description: 'Coordinates updated from map. You can now fetch the new soil data.',
    });
  };

  const hasManualCoordinates = watchLatitude !== undefined && watchLongitude !== undefined;

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-primary" />
            <T textKey="title" />
          </CardTitle>
          <CardDescription>
           <T textKey="description" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <div className="space-y-4">
                  <FormLabel className="font-headline text-lg"><T textKey="locationLabel" /></FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="any" placeholder={translatedText.latitudePlaceholder} {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="any" placeholder={translatedText.longitudePlaceholder} {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                    <div className="flex flex-wrap gap-2">
                         <Button type="button" variant="outline" size="sm" onClick={handleManualFetch} disabled={isFetchingLocation || isTranslating}>
                            {isFetchingLocation && watchLatitude !== undefined ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Crosshair className="mr-2 h-4 w-4" />)}
                             <T textKey="fetchCoordsButton" />
                         </Button>
                         <Button type="button" variant="outline" size="sm" onClick={handleLocationFetch} disabled={isFetchingLocation || isTranslating}>
                             {isFetchingLocation && watchLatitude === undefined ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<MapPin className="mr-2 h-4 w-4" />)}
                            <T textKey="detectLocationButton" />
                        </Button>
                    </div>
                   <FormDescription>
                      <T textKey="locationDescription" />
                    </FormDescription>
              </div>

               {/* Farming Practices Section */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg flex items-center gap-2"><Tractor className="text-primary/80"/><T textKey="farmDetailsLabel" /></h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="rainfall" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="annualRainfallLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                          <SelectContent>
                            <SelectItem value="<500mm">Low (&lt;500mm)</SelectItem>
                            <SelectItem value="500-1000mm">Medium (500-1000mm)</SelectItem>
                            <SelectItem value=">1000mm">High (&gt;1000mm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="soilType" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="soilTypeLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                          <SelectContent>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="loam">Loam</SelectItem>
                             <SelectItem value="silty">Silty</SelectItem>
                             <SelectItem value="peaty">Peaty</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="primaryGoal" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="primaryGoalLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                          <SelectContent>
                             <SelectItem value="cash-crop">Cash Crop / Profit</SelectItem>
                             <SelectItem value="personal-consumption">Personal Consumption</SelectItem>
                             <SelectItem value="mixed">Mixed Use</SelectItem>
                             <SelectItem value="soil-improvement">Soil Improvement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="riskTolerance" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="riskToleranceLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                          <SelectContent>
                             <SelectItem value="low">Low Risk</SelectItem>
                             <SelectItem value="medium">Medium Risk</SelectItem>
                             <SelectItem value="high">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fieldSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="fieldSizeLabel" /></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={translatedText.fieldSizePlaceholder}
                            {...field}
                             value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="totalBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><T textKey="totalBudgetLabel" /></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder={translatedText.totalBudgetPlaceholder} {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField control={form.control} name="fertilizer" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="fertilizerPrefLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
                          <SelectContent>
                             <SelectItem value="organic">Organic</SelectItem>
                             <SelectItem value="synthetic">Synthetic</SelectItem>
                             <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="irrigation" render={({ field }) => (
                      <FormItem>
                        <FormLabel><T textKey="irrigationMethodLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                            </FormControl>
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
                 </div>
                 <div>
                    <FormLabel><T textKey="cropHistoryLabel" /></FormLabel>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <FormField control={form.control} name="recentCrop" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground"><T textKey="recentCropLabel" /></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isTranslating}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="recentCropYear" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs text-muted-foreground"><T textKey="harvestYearLabel" /></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormDescription className="mt-2">
                      <T textKey="cropHistoryDescription" />
                    </FormDescription>
                 </div>
              </div>


              <Button type="submit" disabled={isLoading || isTranslating} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sprout className="mr-2 h-4 w-4" />
                )}
                <T textKey="recommendButton" />
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
                <T textKey="placeholderDescription" />
              </p>
            </CardContent>
          </Card>
        )}
        {recommendation && (
          <Card className="animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline">
                <T textKey="resultTitle" />
              </CardTitle>
              <CardDescription>
                <T textKey="resultDescription" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg font-headline"><T textKey="recommendedCropsLabel" /></h3>
                <p className="text-muted-foreground">{recommendation.crops}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg font-headline"><T textKey="reasoningLabel" /></h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {recommendation.reasoning}
                </p>
              </div>
               {recommendation.soilDataSummary && (
                 <div>
                    <h3 className="font-semibold text-lg font-headline flex items-center gap-2"><CloudSun className="text-primary" /><T textKey="dataSummaryTitle" /></h3>
                     <ul className="text-muted-foreground text-sm list-disc pl-5 mt-2 grid grid-cols-2 gap-x-4">
                      <li>pH: {recommendation.soilDataSummary.ph}</li>
                      <li>Nitrogen: {recommendation.soilDataSummary.n}</li>
                      <li>Phosphorus: {recommendation.soilDataSummary.p}</li>
                      <li>Potassium: {recommendation.soilDataSummary.k}</li>
                      <li>Organic Carbon: {recommendation.soilDataSummary.oc}</li>
                      {recommendation.soilDataSummary.currentTemp && <li>Temp: {recommendation.soilDataSummary.currentTemp}</li>}
                      {recommendation.soilDataSummary.humidity && <li>Humidity: {recommendation.soilDataSummary.humidity}</li>}
                      {recommendation.soilDataSummary.forecast && <li className="col-span-2">Forecast: {recommendation.soilDataSummary.forecast}</li>}
                    </ul>
                 </div>
              )}
            </CardContent>
          </Card>
        )}
        {!isLoading && !recommendation && (
           <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
               <Sprout className="h-12 w-12 text-muted-foreground/50" />
               <p className="mt-4 text-muted-foreground"><T textKey="placeholderTitle" /></p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
    <Dialog open={isSoilDataDialogOpen} onOpenChange={setIsSoilDataDialogOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 font-headline">
            <TestTube2 className="text-primary"/>
            <T textKey="soilDialogTitle" />
          </DialogTitle>
          <DialogDescription>
            <T textKey="soilDialogDescription" />
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow p-6 overflow-auto">
          <Tabs defaultValue="table" className="w-full h-full flex flex-col">
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value="table"><T textKey="tableTab" /></TabsTrigger>
              <TabsTrigger value="maps"><T textKey="mapsTab" /></TabsTrigger>
              <TabsTrigger value="raw"><T textKey="rawTab" /></TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4 rounded-md border flex-grow overflow-y-auto">
                <SoilDataTable soilData={soilData} />
            </TabsContent>
            <TabsContent value="raw" className="mt-4 flex-grow">
              <ScrollArea className="h-full rounded-md border p-4 bg-muted">
                <pre className="text-sm">
                {JSON.stringify(soilData, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="maps" className="mt-4 flex-grow">
              <div className="h-full rounded-md overflow-hidden border">
                  {isSoilDataDialogOpen && (
                    <InteractiveMap 
                      latitude={watchLatitude ?? 23.61}
                      longitude={watchLongitude ?? 85.27}
                      onMapClick={handleMapClick}
                      dummyLocations={dummyLocations}
                    />
                  )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="sm:justify-between gap-2 p-6 pt-4 border-t">
          <Button variant="secondary" asChild>
            <Link href={`https://www.google.com/maps?q=${form.getValues('latitude')},${form.getValues('longitude')}`} target="_blank">
              <Map className="mr-2 h-4 w-4"/>
              <T textKey="googleMapsButton" />
            </Link>
          </Button>
          <div className="flex gap-2 justify-end">
            <DialogClose asChild>
            <Button variant="outline"><T textKey="cancelButton" /></Button>
            </DialogClose>
            <Button onClick={() => setIsSoilDataDialogOpen(false)} disabled={isTranslating}>
              <T textKey="useDataButton" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
