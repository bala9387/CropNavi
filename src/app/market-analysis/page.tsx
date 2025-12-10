
'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeMarketData } from '@/ai/flows/summarize-market-data';
import { SummarizeMarketDataOutput } from '@/ai/flows/summarize-market-data.schemas';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Info, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { allStates, allDistricts } from '@/ai/data/indian-states-districts';

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LineChart, FileText, BarChart, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  marketData: z.string().min(20, { message: 'Please provide more market data.' }).optional().or(z.literal('')),
  farmerExpenditures: z.string().min(3, { message: 'Please enter your expenditures.' }),
});

const commodities = ["Wheat", "Paddy", "Maize", "Mustard", "Arhar (Tur)", "Bajra", "Barley", "Black Pepper", "Cardamom", "Cashew Nuts", "Castor Seed", "Coconut", "Coffee", "Coriander", "Cotton", "Finger Millet (Ragi)", "Gram (Chana)", "Groundnut", "Guar Seed", "Horse-gram", "Jowar (Sorghum)", "Jute", "Korra", "Lentil (Masur)", "Linseed", "Mahua", "Masur", "Moong (Green Gram)", "Niger Seed", "Onion", "Other Pulses", "Potato", "Ragi", "Rapeseed & Mustard", "Rice", "Rubber", "Safflower", "Sannhamp", "Sesamum", "Soyabean", "Sugarcane", "Sunflower", "Tamarind", "Tea", "Tobacco", "Turmeric", "Urad", "Varagu"];
const states = allStates;
const districts: { [key: string]: string[] } = allDistricts;

const originalText = {
  title: "Market Price Visualization",
  description: "Select filters to see price trends for a crop in your market.",
  selectCommodity: "Select Commodity",
  selectState: "Select State",
  selectDistrict: "Select District",
  enterMarket: "Enter Market Name",
  fromDate: "From Date",
  toDate: "To Date",
  clearFilters: "Clear All Filters",
  fetchError: "Could Not Fetch Data",
  noData: "No market data found for this crop/region.",
  selectFilters: "Please select filters to view price data.",
  analysisTitle: "Generate Market & Profit Analysis",
  analysisDescription: "Filter for market data above, then add your costs to get an AI-powered financial summary.",
  marketDataLabel: "Market Data (per Ton)",
  marketDataPlaceholder: "This will be auto-filled with data from the chart above. You can also paste your own.",
  expendituresLabel: "Your Expenditures",
  expendituresPlaceholder: "e.g., Seeds: ₹2000, Fertilizer: ₹3500, Labor: ₹5000",
  analyzeButton: "Analyze Now",
  analyzing: "Generating analysis...",
  aiAnalysisTitle: "AI-Generated Analysis",
  marketSummary: "Market Summary",
  profitLoss: "Profit & Loss Analysis",
  analysisPlaceholder: "Your market analysis and profit/loss summary will appear here.",
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1 text-sm">
          <p className="font-bold">{data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}</p>
          <p className="text-muted-foreground">{data.variety}</p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="font-semibold">Modal:</span>
              <span>₹{data.price}</span>
              <span className="font-semibold">Min:</span>
              <span>₹{data.minPrice}</span>
              <span className="font-semibold">Max:</span>
              <span>₹{data.maxPrice}</span>
          </div>
           <p className="text-xs text-muted-foreground/80 mt-2">Prices are per Ton</p>
        </div>
      </div>
    );
  }

  return null;
};

export default function MarketAnalysisPage() {
  const [analysis, setAnalysis] = useState<SummarizeMarketDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [selectedCommodity, setSelectedCommodity] = useState<string>("Wheat");
  const [selectedState, setSelectedState] = useState<string>("Punjab");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Amritsar");
  const [selectedMarket, setSelectedMarket] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { translatedText, T, isTranslating } = useTranslation(originalText);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { marketData: '', farmerExpenditures: '' },
  });
  
  useEffect(() => {
    setIsMounted(true);
    const defaultToDate = new Date();
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultToDate.getDate() - 30);
    setToDate(defaultToDate);
    setFromDate(defaultFromDate);
  }, []);

  const hasFilters = selectedCommodity || selectedState || selectedDistrict || selectedMarket || fromDate || toDate;

  const fetchData = useCallback(async () => {
    if (!hasFilters || !fromDate || !toDate) {
      setChartData([]);
      setError(null);
      return;
    }
    setIsChartLoading(true);
    setError(null);
    setChartData([]);
    const params = new URLSearchParams();
    if (selectedCommodity) params.append('commodity', selectedCommodity);
    if (selectedState) params.append('state', selectedState);
    if (selectedDistrict) params.append('district', selectedDistrict);
    if (selectedMarket) params.append('market', selectedMarket);
    if (fromDate) params.append('fromDate', format(fromDate, 'yyyy-MM-dd'));
    if (toDate) params.append('toDate', format(toDate, 'yyyy-MM-dd'));

    try {
      const response = await fetch(`/api/market-data?${params.toString()}`);
      
      if (!response.ok) {
          throw new Error('Server temporarily unavailable. Please try again in a few minutes.');
      }
      
      const result = await response.json();
      
      const { data } = result;

      const processedData = data.map((d: any) => ({
        ...d,
        price: parseFloat(d.price) || 0,
        minPrice: parseFloat(d.minPrice) || 0,
        maxPrice: parseFloat(d.maxPrice) || 0,
        name: d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setChartData(processedData);

      if(processedData.length > 0) {
          const marketDataString = `Recent prices for ${selectedCommodity} in ${selectedMarket || selectedDistrict || selectedState}:\n` +
            processedData.map(d => `- ${d.name}: ₹${d.price}/ton`).join('\n');
          form.setValue('marketData', marketDataString);
      } else {
          form.setValue('marketData', '');
      }

    } catch (err: any) {
      console.error("Error fetching chart data:", err);
      const networkError = 'Check your internet connection and retry.';
      const serverError = 'Server temporarily unavailable. Please try again in a few minutes.';
      setError(err instanceof TypeError ? networkError : serverError);
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  }, [selectedCommodity, selectedState, selectedDistrict, selectedMarket, fromDate, toDate, form, hasFilters]);

  useEffect(() => {
    if (isMounted && fromDate && toDate) {
      fetchData();
    }
  }, [fetchData, fromDate, toDate, isMounted]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.marketData) {
        toast({
            title: "Missing Data",
            description: "Please filter for some market data first before generating an analysis.",
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await summarizeMarketData(values as {marketData: string, farmerExpenditures: string});
      setAnalysis(result);
    } catch (error) {
      console.error('Error getting market analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to get market analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function clearFilters() {
    setSelectedCommodity("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedMarket("");
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    setFromDate(monthAgo);
    setToDate(today);
  }

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
     <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline"><T textKey="title" /></CardTitle>
          <CardDescription><T textKey="description" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Select onValueChange={setSelectedCommodity} value={selectedCommodity} disabled={isTranslating}>
              <SelectTrigger>
                <SelectValue placeholder={<T textKey="selectCommodity" />} />
              </SelectTrigger>
              <SelectContent>
                {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => {setSelectedState(value); setSelectedDistrict(""); setSelectedMarket("");}} value={selectedState} disabled={isTranslating}>
              <SelectTrigger>
                <SelectValue placeholder={<T textKey="selectState" />} />
              </SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => {setSelectedDistrict(value); setSelectedMarket('');}} value={selectedDistrict} disabled={!selectedState || isTranslating}>
              <SelectTrigger>
                <SelectValue placeholder={<T textKey="selectDistrict" />} />
              </SelectTrigger>
              <SelectContent>
                {selectedState && districts[selectedState] && districts[selectedState].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input 
              placeholder={translatedText.enterMarket}
              value={selectedMarket} 
              onChange={(e) => setSelectedMarket(e.target.value)} 
              disabled={(!selectedDistrict && !selectedState) || isTranslating}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal lg:col-span-1",
                    !fromDate && "text-muted-foreground"
                  )}
                  disabled={isTranslating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "yyyy-MM-dd") : <span><T textKey="fromDate" /></span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal lg:col-span-1",
                    !toDate && "text-muted-foreground"
                  )}
                  disabled={isTranslating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "yyyy-MM-dd") : <span><T textKey="toDate" /></span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={clearFilters} variant="outline" className="lg:col-span-2" disabled={isTranslating}><T textKey="clearFilters" /></Button>
          </div>
          
          <div className="h-[300px]">
            {isChartLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} label={{ value: 'Price per Ton', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }, offset: -5 }} />
                  <Tooltip
                    cursor={{fill: 'hsl(var(--accent))', opacity: 0.3}}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                 <BarChart className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 max-w-xs">
                  {hasFilters ? <T textKey="noData" /> : <T textKey="selectFilters" />}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileText className="text-primary" />
              <T textKey="analysisTitle" />
            </CardTitle>
            <CardDescription>
             <T textKey="analysisDescription" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="marketData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="marketDataLabel" /></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={translatedText.marketDataPlaceholder}
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmerExpenditures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><T textKey="expendituresLabel" /></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={translatedText.expendituresPlaceholder}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || isTranslating} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LineChart className="mr-2 h-4 w-4" />}
                  <T textKey="analyzeButton" />
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
                <p className="mt-4 text-muted-foreground"><T textKey="analyzing" /></p>
              </CardContent>
            </Card>
          )}
          {analysis && (
            <Card className="animate-in fade-in-50">
              <CardHeader>
                <CardTitle className="font-headline"><T textKey="aiAnalysisTitle" /></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg font-headline"><T textKey="marketSummary" /></h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-headline"><T textKey="profitLoss" /></h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{analysis.profitLossAnalysis}</p>
                </div>
              </CardContent>
            </Card>
          )}
           {!isLoading && !analysis && (
           <Card className="border-dashed">
             <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
               <BarChart className="h-12 w-12 text-muted-foreground/50" />
               <p className="mt-4 text-muted-foreground"><T textKey="analysisPlaceholder" /></p>
             </CardContent>
           </Card>
        )}
        </div>
      </div>
    </div>
  );
}
