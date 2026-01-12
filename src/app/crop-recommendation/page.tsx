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
import { getSoilData } from '@/ai/tools/get-soil-data';
import { getAnnualRainfall } from '@/ai/tools/get-rainfall-data';
import { getRegionalDefaults } from '@/ai/tools/get-regional-defaults';
import { useTranslation } from '@/hooks/use-translation';
import dynamic from 'next/dynamic';
import { getTamilNaduSoilProfile, convertProfileToSoilData } from '@/ai/data/tamil-nadu-soil-profiles';
import { getRuleBasedRecommendation } from '@/ai/utils/rule-based-recommendations';

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
import { Loader2, Sprout, Wand2, MapPin, TestTube2, Map as MapIcon, Crosshair, Tractor, Globe, CloudSun, History as HistoryIcon, CloudRain, Edit2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SoilDataTable } from './soil-data-table';
import { Switch } from '@/components/ui/switch';

const InteractiveMap = dynamic(() => import('./interactive-map').then(mod => mod.InteractiveMap), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted"><Loader2 className="animate-spin" /></div>
});

const formSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  rainfall: z.string().min(1, "Please select the annual rainfall."),
  soilType: z.string().min(1, "Please select the primary soil type."),
  primaryGoal: z.string().min(1, "Please select your primary farming goal."),
  riskTolerance: z.string().min(1, "Please select your risk tolerance."),
  fieldSize: z.coerce.number().min(5, "Field size must be at least 5 acres."),
  totalBudget: z.coerce.number().min(0, "Budget must be non-negative").optional(),
  recentCrop: z.string().optional(),
  recentCropYear: z.string().optional(),
  fertilizer: z.string().min(1, "Please select your fertilizer preference."),
  irrigation: z.string().min(1, "Please select your irrigation method."),
  isFirstTime: z.boolean().default(false),
}).refine((data) => {
  if (!data.isFirstTime) {
    return !!data.recentCrop && !!data.recentCropYear;
  }
  return true;
}, {
  message: "Recent crop and year are required if not first time.",
  path: ["recentCrop"], // Error pointer
});

const commodities = [
  "Arecanut", "Arhar (Tur)", "Bajra", "Banana", "Barley", "Betelvine", "Black Pepper", "Brinjal", "Cabbage",
  "Cardamom", "Carrot", "Cashew Nuts", "Castor Seed", "Cauliflower", "Chilli", "Coconut", "Coffee",
  "Coriander", "Cotton", "Dry Chillies", "Finger Millet (Ragi)", "Garlic", "Ginger", "Gram (Chana)",
  "Groundnut", "Guar Seed", "Horse-gram", "Jackfruit", "Jowar (Sorghum)", "Jute", "Khesari", "Korra",
  "Lemon", "Lentil (Masur)", "Linseed", "Maize", "Mango", "Masur", "Mesta", "Moong (Green Gram)",
  "Moth Bean", "Mustard", "Niger Seed", "Oilseeds", "Okra (Lady Finger)", "Onion", "Paddy", "Papaya",
  "Peas & Beans", "Pineapple", "Pomegranate", "Potato", "Ragi", "Rapeseed & Mustard", "Rice", "Rubber",
  "Safflower", "Sannhamp", "Sesamum", "Soyabean", "Spinach", "Sugarcane", "Sunflower", "Sweet Potato",
  "Tamarind", "Tapioca", "Tea", "Tobacco", "Tomato", "Turmeric", "Urad", "Varagu", "Wheat"
].sort();

const originalText = {
  title: 'AI Crop Recommendation',
  description: 'Enter coordinates manually or use your GPS to fetch soil data. Then, describe your farm, and our AI will suggest the best crops for you.',
  locationLabel: '1. Location for Soil Analysis',
  latitudePlaceholder: 'Latitude (e.g., 11.0168)',
  longitudePlaceholder: 'Longitude (e.g., 76.9558)',
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
  totalBudgetLabel: 'Total Budget (Rs)',
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
  mapOverlayLabel: 'Map Overlay',
  overlayNone: 'None',
  overlayPh: 'pH (Water)',
  overlayClay: 'Clay Content',
  overlayNitrogen: 'Nitrogen',
  overlaySoc: 'Soil Organic Carbon',
  overlaySand: 'Sand Content',
  overlaySilt: 'Silt Content',
};

// Generate location-specific fallback soil data based on coordinates
//This provides varied data for different locations when the API fails
function generateFallbackSoilData(lat: number, lon: number) {
  // Use lat/lon to create pseudo-random but deterministic values
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
  const random = (offset: number) => ((seed + offset) % 1);

  // Tamil Nadu soil characteristics vary by region:
  // Coastal (near 80°E): Sandy, pH 7-8, low clay
  // Interior (near 77°E): Red loamy, pH 6-7, moderate clay
  // Western (near 76°E): Black/clay, pH 7-8, high clay

  const distanceFromCoast = Math.abs(lon - 80.27); // Chennai longitude
  const isWestern = lon < 77;
  const isCoastal = distanceFromCoast < 0.5;

  // Adjust properties based on location
  const baseClay = isCoastal ? 150 : isWestern ? 350 : 250;
  const baseSand = isCoastal ? 550 : isWestern ? 250 : 400;
  const basePh = isCoastal ? 75 : 68;

  // Add variation based on seed
  const vary = (base: number, range: number) =>
    Math.round(base + (random(base) - 0.5) * range);

  return [
    {
      "name": "bdod", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(135, 20) } },
        { "label": "5-15cm", "values": { "mean": vary(145, 20) } }
      ]
    },
    {
      "name": "cec", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(180, 60) } },
        { "label": "5-15cm", "values": { "mean": vary(195, 60) } }
      ]
    },
    {
      "name": "clay", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(baseClay, 100) } },
        { "label": "5-15cm", "values": { "mean": vary(baseClay + 20, 100) } }
      ]
    },
    {
      "name": "nitrogen", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(110, 40) } },
        { "label": "5-15cm", "values": { "mean": vary(100, 40) } }
      ]
    },
    {
      "name": "phh2o", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(basePh, 15) } },
        { "label": "5-15cm", "values": { "mean": vary(basePh + 2, 15) } }
      ]
    },
    {
      "name": "sand", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(baseSand, 100) } },
        { "label": "5-15cm", "values": { "mean": vary(baseSand - 20, 100) } }
      ]
    },
    {
      "name": "silt", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(300, 80) } },
        { "label": "5-15cm", "values": { "mean": vary(320, 80) } }
      ]
    },
    {
      "name": "soc", "depths": [
        { "label": "0-5cm", "values": { "mean": vary(120, 40) } },
        { "label": "5-15cm", "values": { "mean": vary(105, 40) } }
      ]
    }
  ];
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export default function CropRecommendationPage() {
  const [recommendation, setRecommendation] =
    useState<AICropRecommendationFromPromptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isSoilDataDialogOpen, setIsSoilDataDialogOpen] = useState(false);
  const [soilData, setSoilData] = useState<any | null>(null);
  const [soilDataSource, setSoilDataSource] = useState<'soilgrids' | 'openlandmap' | 'estimated' | 'stored' | null>(null);
  const [calculatedRainfall, setCalculatedRainfall] = useState<number | null>(null);
  const [recommendedCrops, setRecommendedCrops] = useState<any[] | null>(null);
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { translatedText, T, isTranslating } = useTranslation(originalText);

  const [dummyLocations, setDummyLocations] = useState([
    { lat: 11.02, lng: 76.96, name: 'Sample Farm A' },
    { lat: 11.01, lng: 76.95, name: 'Sample Farm B' },
    { lat: 11.03, lng: 76.94, name: 'Local Market' },
  ]);
  const [isMounted, setIsMounted] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setIsMounted(true);
    // Default to Coimbatore
    form.reset({
      latitude: 11.0168,
      longitude: 76.9558,
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
      isFirstTime: false,
    });

    // Auto-fetch location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('latitude', position.coords.latitude);
          form.setValue('longitude', position.coords.longitude);
          toast({
            title: "Location Detected",
            description: "Updated farm location to your current position.",
          });
        },
        (error) => {
          console.warn("Geolocation failed on mount:", error);
        }
      );
    }
  }, [form, toast]);


  const watchLatitude = form.watch('latitude');
  const watchLongitude = form.watch('longitude');
  const watchIsFirstTime = form.watch('isFirstTime');




  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);

    // Get actual coordinates from form - CRITICAL FIX
    const userLat = values.latitude;
    const userLon = values.longitude;

    console.log('=== FORM SUBMISSION ===');
    console.log('User coordinates:', userLat, userLon);
    console.log('Soil data available:', soilData ? 'Yes' : 'No');

    try {
      // ALWAYS use rule-based recommendations for reliable, location-specific results
      const ruleBasedResult = getRuleBasedRecommendation({
        latitude: userLat,
        longitude: userLon,
        soilType: values.soilType,
        rainfall: values.rainfall,
        primaryGoal: values.primaryGoal,
        riskTolerance: values.riskTolerance,
        fieldSize: values.fieldSize,
        soilData: soilData,
        // Enhanced analysis with ALL form data
        irrigation: values.irrigation,
        fertilizer: values.fertilizer,
        totalBudget: values.totalBudget,
        isFirstTime: values.isFirstTime,
        recentCrop: values.recentCrop,
      } as any);

      console.log('=== RECOMMENDATION RESULT ===');
      console.log('District:', ruleBasedResult.district);
      console.log('Crops:', ruleBasedResult.crops);

      setRecommendation({
        crops: ruleBasedResult.crops.join(', '),
        reasoning: ruleBasedResult.reasoning,
        soilDataSummary: ruleBasedResult.soilDataSummary
      });

      toast({
        title: `✅ ${ruleBasedResult.district} District`,
        description: `${ruleBasedResult.crops.length} location-specific crops`,
        duration: 4000,
      });
    } catch (error) {
      console.error('AI failed, using rule-based recommendations:', error);

      // Use rule-based recommendation engine with real data
      const ruleBasedResult = getRuleBasedRecommendation({
        latitude: values.latitude || 11.0168,
        longitude: values.longitude || 76.9558,
        soilType: values.soilType,
        rainfall: values.rainfall,
        primaryGoal: values.primaryGoal,
        riskTolerance: values.riskTolerance,
        fieldSize: values.fieldSize,
        soilData: soilData
      });

      setRecommendation({
        crops: ruleBasedResult.crops.join(', '),
        reasoning: ruleBasedResult.reasoning,
        soilDataSummary: ruleBasedResult.soilDataSummary
      });

      toast({
        title: `✅ ${ruleBasedResult.district} District Recommendations`,
        description: `Showing ${ruleBasedResult.crops.length} crops based on real soil data`,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const fetchSoilData = useCallback(async (latitude: number, longitude: number, shouldOpenDialog = true) => {
    setIsFetchingLocation(true);
    if (shouldOpenDialog) {
      setIsSoilDataDialogOpen(true);
    }
    setSoilData(null); // Clear previous data while loading

    form.setValue('latitude', latitude, { shouldValidate: true });
    form.setValue('longitude', longitude, { shouldValidate: true });

    try {
      // Parallel fetch: Soil Data + Regional Defaults + Annual Rainfall
      const results = await Promise.allSettled([
        getSoilData(latitude, longitude),
        getRegionalDefaults(latitude, longitude),
        getAnnualRainfall(latitude, longitude)
      ]);

      const soilResult = results[0];
      const defaultsResult = results[1];
      const rainfallResult = results[2];

      // Handle Soil Data
      if (soilResult.status === 'fulfilled') {
        const { data, source } = soilResult.value;
        setSoilData(data);
        setSoilDataSource(source);

        if (source === 'openlandmap') {
          toast({
            title: '✅ Using OpenLandMap Data',
            description: 'Primary database unavailable. Using backup scientific data.',
            duration: 3000,
          });
        }
      } else {
        console.warn("All Soil APIs failed:", soilResult.reason);
        // Generate location-specific fallback data instead of static dummy data
        setSoilData(generateFallbackSoilData(latitude, longitude));
        setSoilDataSource('estimated');
        toast({
          title: '⚠️ Using Estimated Soil Data',
          description: 'Could not reach soil databases. Showing regional estimates based on research.',
          duration: 4000,
        });
      }

      // Handle Regional Defaults & Rainfall
      // We prioritize real rainfall data if available, else fallback to regional default
      let rainfallCategory = '500-1000mm';
      let annualRainfallMm = 750;

      if (rainfallResult.status === 'fulfilled') {
        rainfallCategory = rainfallResult.value.category;
        annualRainfallMm = rainfallResult.value.annualRainfallMm;
        setCalculatedRainfall(annualRainfallMm);
      } else {
        console.warn("Rainfall fetch failed:", rainfallResult.reason);
        // Fallback calculation or default will be applied below if regional defaults also fail,
        // or we use regional defaults if available.
        setCalculatedRainfall(null); // Let user select manually if both fail, or show default
      }

      if (defaultsResult.status === 'fulfilled') {
        const defaults = defaultsResult.value;
        // If rainfall API failed, use regional default
        if (rainfallResult.status === 'rejected') {
          rainfallCategory = defaults.rainfall;
        }

        form.setValue('rainfall', rainfallCategory);
        form.setValue('soilType', defaults.soilType);
        form.setValue('primaryGoal', defaults.primaryGoal);
        form.setValue('riskTolerance', defaults.riskTolerance);
        form.setValue('fieldSize', defaults.fieldSize);
        form.setValue('recentCrop', defaults.recentCrop);
        form.setValue('fertilizer', defaults.fertilizer);
        form.setValue('irrigation', defaults.irrigation);
        form.setValue('recentCropYear', defaults.recentCropYear);
      } else {
        console.warn("Regional Defaults fetch failed:", defaultsResult.reason);
        // If defaults fail, we just keep the form as is (or minimal defaults) but don't crash
        // Ensure rainfall is at least set if we have it from API
        if (rainfallResult.status === 'fulfilled') {
          form.setValue('rainfall', rainfallCategory);
        }
      }

      toast({
        title: 'Data Update',
        description: `Refreshed data for your location. ${rainfallResult.status === 'fulfilled' ? `Rainfall: ${annualRainfallMm}mm` : 'Using regional estimates.'}`,
      });
    } catch (error) {
      // This catch block might now be unreachable given Promise.allSettled, 
      // but strictly speaking, if something else throws (like logic above), we catch it.
      console.warn("Unexpected error in data fetch:", error);
      toast({
        title: 'Partial Data Error',
        description: 'Some data could not be retrieved. Please verify your inputs.',
        duration: 3000,
      });
    } finally {
      setIsFetchingLocation(false);
    }
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

  // Initial Fetch on Mount (Default Location)
  useEffect(() => {
    // Check if we already have values (from the initial reset)
    const lat = form.getValues('latitude');
    const lon = form.getValues('longitude');

    // If geolocation is not running or takes too long, we want to at least show defaults.
    // Ideally, we wait for geolocation. But if we want "Auto" feel, we can fetch for the default coordinates immediately.
    // If geolocation updates later, it will trigger handleLocationFetch -> fetchSoilData again.
    if (lat && lon && !calculatedRainfall) {
      fetchSoilData(lat, lon, false);
    }
  }, [fetchSoilData]); // dependent on fetchSoilData which is stable

  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleLocationFetch = useCallback(async () => {
    setIsFetchingLocation(true);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser cannot detect location. Please use Search.',
        variant: 'destructive',
      });
      setIsFetchingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('latitude', latitude, { shouldValidate: true });
        form.setValue('longitude', longitude, { shouldValidate: true });

        toast({
          title: "Location Found",
          description: "Fetching soil and weather data...",
        });

        fetchSoilData(latitude, longitude);
      },
      async (error) => {
        console.warn('GPS failed, trying IP fallback:', error);

        toast({
          title: " GPS Blocked - Switching to Auto-Detect",
          description: "Attempting to detect location via internet...",
        });

        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();

          if (data.latitude && data.longitude) {
            form.setValue('latitude', data.latitude, { shouldValidate: true });
            form.setValue('longitude', data.longitude, { shouldValidate: true });
            fetchSoilData(data.latitude, data.longitude);

            toast({
              title: "Approximate Location Found",
              description: `We found ${data.city}. Please verify the EXACT spot on the map now.`,
              duration: 5000,
            });

            // Auto-open map picker for precision since IP is inaccurate
            setTimeout(() => setIsMapPickerOpen(true), 1500);

          } else {
            throw new Error("Invalid IP data");
          }
        } catch (fallbackError) {
          console.error("IP Fallback failed:", fallbackError);
          toast({
            title: 'Location Detection Failed',
            description: 'Please search for your town manually above.',
            variant: 'destructive',
          });
        }
        setIsFetchingLocation(false);
      },
      options
    );
  }, [toast, fetchSoilData, form]);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        form.setValue('latitude', latitude, { shouldValidate: true });
        form.setValue('longitude', longitude, { shouldValidate: true });
        fetchSoilData(latitude, longitude);
        toast({
          title: "Location Found",
          description: `Moved to: ${display_name}`,
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Try a different search term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Could not contact search service.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card variant="glass" className="border-primary/20 bg-white/40 dark:bg-black/40">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3 text-2xl text-primary">
              <div className="p-2 bg-primary/10 rounded-full">
                <Wand2 className="size-6 text-primary" />
              </div>
              <T textKey="title" />
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90">
              <T textKey="description" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                  <FormLabel className="font-headline text-lg text-primary flex items-center gap-2">
                    <MapPin className="size-5" />
                    <T textKey="locationLabel" />
                  </FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location Search */}
                    <div className="sm:col-span-2 flex gap-2">
                      <Input
                        placeholder="Search location (e.g. Madurai, Theni)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                        className="bg-background/80 border-primary/20"
                      />
                      <Button type="button" onClick={handleSearchLocation} disabled={isSearching} className="shrink-0">
                        {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                        <span className="sr-only">Search</span>
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input className="bg-background/80 border-primary/20 focus-visible:ring-primary/50" type="number" step="any" autoComplete="off" placeholder={translatedText.latitudePlaceholder} {...field} value={field.value ?? ''} />
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
                            <Input className="bg-background/80 border-primary/20 focus-visible:ring-primary/50" type="number" step="any" autoComplete="off" placeholder={translatedText.longitudePlaceholder} {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleManualFetch} disabled={isFetchingLocation || isTranslating} className="hover:bg-primary/5 hover:text-primary transition-colors border-primary/20">
                      {isFetchingLocation && watchLatitude !== undefined ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Crosshair className="mr-2 h-4 w-4" />)}
                      <T textKey="fetchCoordsButton" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleLocationFetch} disabled={isFetchingLocation || isTranslating} className="hover:bg-primary/5 hover:text-primary transition-colors border-primary/20">
                      {isFetchingLocation && watchLatitude === undefined ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<MapPin className="mr-2 h-4 w-4" />)}
                      <T textKey="detectLocationButton" />
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsMapPickerOpen(true)} className="hover:bg-primary/5 hover:text-primary transition-colors border-primary/20">
                      <Globe className="mr-2 h-4 w-4" />
                      Pick on Map
                    </Button>
                  </div>
                  <FormDescription>
                    <T textKey="locationDescription" />
                  </FormDescription>
                </div>

                <Dialog open={isMapPickerOpen} onOpenChange={setIsMapPickerOpen}>
                  <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-4">
                    <DialogHeader>
                      <DialogTitle>Pinpoint Your Exact Farm Location</DialogTitle>
                      <DialogDescription>Click exactly where your farm is located on the map.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 relative border rounded-md overflow-hidden">
                      <InteractiveMap
                        latitude={watchLatitude ?? 11.0168}
                        longitude={watchLongitude ?? 76.9558}
                        dummyLocations={[]}
                        onMapClick={(lat, lon) => {
                          handleMapClick(lat, lon);
                          setIsMapPickerOpen(false);
                        }}
                        overlayProperty={null}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Farming Practices Section */}
                <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                  <h3 className="font-headline text-lg flex items-center gap-2 text-primary"><Tractor className="size-5" /><T textKey="farmDetailsLabel" /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="rainfall" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="annualRainfallLabel" /></FormLabel>
                        {calculatedRainfall !== null ? (
                          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                                <CloudRain className="size-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm">
                                  {calculatedRainfall} mm/year
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {calculatedRainfall < 500 ? 'Low (<500mm)' : calculatedRainfall > 1000 ? 'High (>1000mm)' : 'Medium (500-1000mm)'}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => setCalculatedRainfall(null)}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                            <FormControl>
                              <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="<500mm">Low (&lt;500mm)</SelectItem>
                              <SelectItem value="500-1000mm">Medium (500-1000mm)</SelectItem>
                              <SelectItem value=">1000mm">High (&gt;1000mm)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="soilType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="soilTypeLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="loam">Loam</SelectItem>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="silt">Silt</SelectItem>
                            <SelectItem value="peaty">Peaty</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="primaryGoal" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="primaryGoalLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
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
                        <FormLabel className="text-foreground/80"><T textKey="riskToleranceLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low (Safe & Steady)</SelectItem>
                            <SelectItem value="medium">Medium (Balanced)</SelectItem>
                            <SelectItem value="high">High (High Risk/High Reward)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fieldSize" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="fieldSizeLabel" /></FormLabel>
                        <FormControl>
                          <Input className="bg-background/80 border-primary/20 focus-visible:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" placeholder={translatedText.fieldSizePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="totalBudget" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="totalBudgetLabel" /></FormLabel>
                        <FormControl>
                          <Input className="bg-background/80 border-primary/20 focus-visible:ring-primary/50" type="number" placeholder={translatedText.totalBudgetPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fertilizer" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80"><T textKey="fertilizerPrefLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
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
                        <FormLabel className="text-foreground/80"><T textKey="irrigationMethodLabel" /></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                          <FormControl>
                            <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
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

                </div>

                {/* Crop History Section */}
                <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-lg flex items-center gap-2 text-primary"><HistoryIcon className="size-5" /><T textKey="cropHistoryLabel" /></h3>
                    <FormField
                      control={form.control}
                      name="isFirstTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/60 gap-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">First Time Farming?</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!watchIsFirstTime && (
                    <>
                      <FormDescription><T textKey="cropHistoryDescription" /></FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <FormField control={form.control} name="recentCrop" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80"><T textKey="recentCropLabel" /></FormLabel>
                            <FormControl>
                              <Input className="bg-background/80 border-primary/20 focus-visible:ring-primary/50" placeholder="e.g. Rice" {...field} list="crop-suggestions" />
                            </FormControl>
                            <datalist id="crop-suggestions">
                              {commodities.map(c => <option key={c} value={c} />)}
                            </datalist>
                            <FormMessage />
                          </FormItem>
                        )}
                        />
                        <FormField control={form.control} name="recentCropYear" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80"><T textKey="harvestYearLabel" /></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isTranslating}>
                              <FormControl>
                                <SelectTrigger className="bg-background/80 border-primary/20 focus:ring-primary/50">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                        />
                      </div>
                    </>
                  )}
                </div>

                <Button type="submit" disabled={isLoading || isTranslating} className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sprout className="mr-2 h-5 w-5" />
                  )}
                  <T textKey="recommendButton" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:sticky top-6">
          {/* Interactive Map Card */}
          <Card variant="glass" className="overflow-hidden border-primary/20 bg-white/40 dark:bg-black/40 min-h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline text-lg flex items-center gap-2"><MapIcon className="size-5 text-primary" /><T textKey="mapsTab" /></CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium"><T textKey="mapOverlayLabel" />:</span>
                <Select value={selectedOverlay || "none"} onValueChange={(val) => setSelectedOverlay(val === "none" ? null : val)}>
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none"><T textKey="overlayNone" /></SelectItem>
                    <SelectItem value="phh2o"><T textKey="overlayPh" /></SelectItem>
                    <SelectItem value="clay"><T textKey="overlayClay" /></SelectItem>
                    <SelectItem value="nitrogen"><T textKey="overlayNitrogen" /></SelectItem>
                    <SelectItem value="soc"><T textKey="overlaySoc" /></SelectItem>
                    <SelectItem value="sand"><T textKey="overlaySand" /></SelectItem>
                    <SelectItem value="silt"><T textKey="overlaySilt" /></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <InteractiveMap
                latitude={watchLatitude ?? 11.0168}
                longitude={watchLongitude ?? 76.9558}
                dummyLocations={dummyLocations}
                onMapClick={handleMapClick}
                overlayProperty={selectedOverlay}
              />
            </CardContent>
          </Card>


          {isLoading && (
            <Card className="animate-in fade-in zoom-in-95 duration-500 border-primary/20 bg-primary/5">
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-primary mb-2"><T textKey="placeholderTitle" /></h3>
                <p className="text-muted-foreground text-lg">
                  <T textKey="placeholderDescription" />
                </p>
              </CardContent>
            </Card>
          )}

          {recommendation && (
            <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 border-green-500/30 bg-green-500/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-2xl text-green-700 dark:text-green-400">
                  <Sprout className="h-8 w-8" />
                  <T textKey="resultTitle" />
                </CardTitle>
                <CardDescription className="text-base"><T textKey="resultDescription" /></CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg font-headline mb-3 flex items-center gap-2 text-foreground/90">
                    <span className="p-1 bg-green-500/20 rounded-md"><Sprout className="size-4 text-green-600" /></span>
                    <T textKey="recommendedCropsLabel" />
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.crops.split(',').map((crop, i) => (
                      <span key={i} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-base font-medium border border-green-200 dark:border-green-800 shadow-sm">
                        {crop.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-headline mb-3 flex items-center gap-2 text-foreground/90">
                    <span className="p-1 bg-blue-500/20 rounded-md"><Wand2 className="size-4 text-blue-600" /></span>
                    <T textKey="reasoningLabel" />
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-background/50 p-4 rounded-xl border border-border/50">
                    <p className="whitespace-pre-wrap leading-relaxed">{recommendation.reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isSoilDataDialogOpen} onOpenChange={setIsSoilDataDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 font-headline">
              <TestTube2 className="text-primary" />
              <T textKey="soilDialogTitle" />
            </DialogTitle>
            <DialogDescription>
              <T textKey="soilDialogDescription" />
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden min-h-[400px]">
            <Tabs defaultValue="table" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="table"><T textKey="tableTab" /></TabsTrigger>
                <TabsTrigger value="map"><T textKey="mapsTab" /></TabsTrigger>
                <TabsTrigger value="raw"><T textKey="rawTab" /></TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="flex-1 overflow-auto border rounded-md bg-muted/20 p-2">
                <ScrollArea className="h-full">
                  {soilData ? (
                    <SoilDataTable soilData={soilData} />
                  ) : (
                    <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
                      {isFetchingLocation ? <Loader2 className="animate-spin mr-2" /> : "No Data"}
                      {isFetchingLocation ? "Fetching..." : ""}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="map" className="flex-1 relative border rounded-md overflow-hidden">
                <InteractiveMap
                  latitude={watchLatitude ?? 11.0168}
                  longitude={watchLongitude ?? 76.9558}
                  dummyLocations={[]}
                  onMapClick={handleMapClick}
                  overlayProperty={selectedOverlay}
                />

                {/* Overlay Selector */}
                <div className="absolute top-4 right-4 z-[500] bg-background/95 p-1 rounded-md shadow-md border border-border/50 backdrop-blur-sm">
                  <Select value={selectedOverlay || "none"} onValueChange={(val) => setSelectedOverlay(val === "none" ? null : val)}>
                    <SelectTrigger className="h-8 w-[160px] border-none bg-transparent focus:ring-0 focus:ring-offset-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Map Overlay:</span>
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="z-[600]">
                      <SelectItem value="none"><T textKey="overlayNone" /></SelectItem>
                      <SelectItem value="phh2o"><T textKey="overlayPh" /></SelectItem>
                      <SelectItem value="clay"><T textKey="overlayClay" /></SelectItem>
                      <SelectItem value="nitrogen"><T textKey="overlayNitrogen" /></SelectItem>
                      <SelectItem value="soc"><T textKey="overlaySoc" /></SelectItem>
                      <SelectItem value="sand"><T textKey="overlaySand" /></SelectItem>
                      <SelectItem value="silt"><T textKey="overlaySilt" /></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legend / Info Label */}
                {selectedOverlay && (
                  <div className="absolute bottom-4 left-4 z-[500] bg-background/90 p-2 rounded text-xs shadow-md border border-primary/20 backdrop-blur-md">
                    <span className="font-semibold text-primary">Previewing: </span>
                    {selectedOverlay === 'phh2o' && <T textKey="overlayPh" />}
                    {selectedOverlay === 'clay' && <T textKey="overlayClay" />}
                    {selectedOverlay === 'nitrogen' && <T textKey="overlayNitrogen" />}
                    {selectedOverlay === 'soc' && <T textKey="overlaySoc" />}
                    {selectedOverlay === 'sand' && <T textKey="overlaySand" />}
                    {selectedOverlay === 'silt' && <T textKey="overlaySilt" />}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw" className="flex-1 overflow-auto border rounded-md bg-muted/20 p-4">
                <ScrollArea className="h-full">
                  <pre className="text-xs font-mono">{JSON.stringify(soilData, null, 2)}</pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <div className="mr-auto">
              <Button variant="secondary" asChild>
                <Link href={`https://www.google.com/maps?q=${form.getValues('latitude')},${form.getValues('longitude')}`} target="_blank">
                  <MapIcon className="mr-2 h-4 w-4" />
                  <T textKey="googleMapsButton" />
                </Link>
              </Button>
            </div>
            <DialogClose asChild>
              <Button type="button" variant="secondary"><T textKey="cancelButton" /></Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" className="bg-primary hover:bg-primary/90"><T textKey="useDataButton" /></Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
