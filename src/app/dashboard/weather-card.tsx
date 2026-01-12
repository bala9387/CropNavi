'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeatherData } from '@/ai/tools/get-weather-data';
import { Loader2, CloudSun, MapPin, Wind, Droplets, CloudRain, CalendarDays, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps, CartesianGrid } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';;

type WeatherData = Awaited<ReturnType<typeof getWeatherData>>;
type ChartableData = {
    date: string;
    avgTemp?: number;
    precipitation?: number;
    minTemp?: number;
    maxTemp?: number;
    description?: string;
    name: string;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ChartableData;
        return (
            <div className="rounded-xl border border-white/20 bg-black/80 backdrop-blur-md p-4 shadow-xl text-sm text-white animate-in zoom-in-95 duration-200">
                <p className="font-bold text-lg mb-1">{format(new Date(data.date), 'EEE, MMM d')}</p>
                {data.description && <p className="text-gray-300 italic mb-3">{data.description}</p>}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {data.minTemp !== undefined && <><span className="font-medium text-blue-300">Min:</span><span className='font-mono'>{data.minTemp.toFixed(1)}°C</span></>}
                    {data.maxTemp !== undefined && <><span className="font-medium text-red-300">Max:</span><span className='font-mono'>{data.maxTemp.toFixed(1)}°C</span></>}
                    {data.avgTemp !== undefined && <><span className="font-medium text-orange-300">Avg:</span><span className='font-mono'>{data.avgTemp.toFixed(1)}°C</span></>}
                    {data.precipitation !== undefined && <><span className="font-medium text-sky-300">Rain:</span><span className='font-mono'>{data.precipitation.toFixed(1)}mm</span></>}
                </div>
            </div>
        );
    }
    return null;
};

type Period = '7D' | '1M' | '6M' | '1Y';

const originalText = {
    title: "Weather Intelligence",
    description: "Coimbatore, Tamil Nadu",
    currentTemp: "Current Temperature",
    humidity: "Humidity",
    wind: "Wind",
    rainfall: "Rainfall",
    now: "Now",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last6Months: "Last 6 Months",
    lastYear: "Last Year",
    min: "Min",
    max: "Max",
    avg: "Avg",
    rain: "Rain",
    yourLocation: "Your Location"
};

import { useTranslation } from '@/hooks/use-translation';

const DEFAULT_COORDS = { latitude: 11.0168, longitude: 76.9558 };

export function WeatherCard() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [historicalData, setHistoricalData] = useState<ChartableData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [period, setPeriod] = useState<Period>('7D');
    const [coordinates, setCoordinates] = useState(DEFAULT_COORDS);
    const [isAutoDetected, setIsAutoDetected] = useState(false);
    const { toast } = useToast();
    const { T, translatedText } = useTranslation(originalText);

    // Initial Geolocation Fetch
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setIsAutoDetected(true);
                    toast({
                        title: "Location Updated",
                        description: "Showing weather for your current location.",
                    });
                },
                (error) => {
                    console.warn("Geolocation access denied or failed:", error);
                    // Automatically falls back to DEFAULT_COORDS (Coimbatore)
                }
            );
        }
    }, [toast]);

    // Fetch initial forecast data
    useEffect(() => {
        const fetchInitialWeather = async () => {
            setIsLoading(true);
            try {
                const data = await getWeatherData(coordinates);
                setWeatherData(data);
            } catch (error) {
                console.error("Failed to fetch weather data:", error);
                toast({
                    title: "Weather Error",
                    description: "Could not load weather data.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialWeather();

        // Refresh every 10 minutes for realtime updates
        const intervalId = setInterval(fetchInitialWeather, 600000);

        return () => clearInterval(intervalId);
    }, [coordinates, toast]);

    // Fetch historical data when period changes
    useEffect(() => {
        const fetchHistoricalWeather = async () => {
            if (period === '7D') {
                setHistoricalData(null); // Use forecast data for 7D
                return;
            }

            setIsFetchingHistory(true);
            // Use 2 days ago as end date to ensure data availability in Archive API
            const endDate = subDays(new Date(), 2);
            let startDate: Date;

            if (period === '1M') startDate = subDays(endDate, 30);
            else if (period === '6M') startDate = subDays(endDate, 180);
            else startDate = subDays(endDate, 365);

            try {
                const data = await getWeatherData({
                    ...coordinates,
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd')
                });
                const formattedData = data.historical?.map(day => ({
                    ...day,
                    name: format(new Date(day.date), 'd MMM'),
                })) || [];
                setHistoricalData(formattedData);
            } catch (error) {
                console.error(`Failed to fetch historical weather for ${period}:`, error);
                toast({
                    title: "Historical Weather Error",
                    description: "Could not load historical weather data.",
                    variant: "destructive"
                });
            } finally {
                setIsFetchingHistory(false);
            }
        };

        fetchHistoricalWeather();
    }, [period, coordinates, toast]);


    if (isLoading) {
        return (
            <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="h-[400px] flex items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted backdrop-blur-md border border-border">
                    <Loader2 className="animate-spin text-primary size-12" />
                </CardContent>
            </Card>
        );
    }

    if (!weatherData) {
        return null;
    }

    const forecastChartData = weatherData.forecast.map(day => ({
        ...day,
        name: format(new Date(day.date), 'EEE'),
        avgTemp: (day.minTemp + day.maxTemp) / 2
    }));

    const chartData = period === '7D' ? forecastChartData : historicalData;
    const totalRainfall = chartData?.reduce((acc, day) => acc + (day.precipitation ?? 0), 0);
    const chartLoading = isFetchingHistory || (isLoading && period !== '7D');

    const periodLabel: Record<Period, string> = {
        '7D': translatedText.last7Days,
        '1M': translatedText.last30Days,
        '6M': translatedText.last6Months,
        '1Y': translatedText.lastYear
    };

    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as ChartableData;
            return (
                <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md p-4 shadow-xl text-sm text-popover-foreground animate-in zoom-in-95 duration-200">
                    <p className="font-bold text-lg mb-1">{format(new Date(data.date), 'EEE, MMM d')}</p>
                    {data.description && <p className="text-muted-foreground italic mb-3">{data.description}</p>}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {data.minTemp !== undefined && <><span className="font-medium text-chart-2">{translatedText.min}:</span><span className='font-mono'>{data.minTemp.toFixed(1)}°C</span></>}
                        {data.maxTemp !== undefined && <><span className="font-medium text-destructive">{translatedText.max}:</span><span className='font-mono'>{data.maxTemp.toFixed(1)}°C</span></>}
                        {data.avgTemp !== undefined && <><span className="font-medium text-chart-3">{translatedText.avg}:</span><span className='font-mono'>{data.avgTemp.toFixed(1)}°C</span></>}
                        {data.precipitation !== undefined && <><span className="font-medium text-primary">{translatedText.rain}:</span><span className='font-mono'>{data.precipitation.toFixed(1)}mm</span></>}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card variant="glass" className="relative overflow-hidden border-primary/10 shadow-lg hover:shadow-xl transition-all duration-500 group">
            {/* Subtle Gradient Overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity duration-500" />

            <div className="relative z-10">
                <CardHeader className="flex flex-row justify-between items-start border-b pb-6">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-3 text-2xl tracking-tight text-foreground">
                            <CloudSun className="text-primary size-8" />
                            <T textKey="title" />
                        </CardTitle>
                        <CardDescription className='flex items-center gap-2 mt-2 font-medium uppercase tracking-wider text-muted-foreground'>
                            <MapPin className={cn('size-4', isAutoDetected ? 'text-blue-500' : 'text-emerald-500')} />
                            {isAutoDetected ? translatedText.yourLocation : <T textKey="description" />}
                        </CardDescription>
                    </div>
                    <div className="flex bg-muted/50 p-1.5 rounded-xl border">
                        {(['7D', '1M', '6M', '1Y'] as Period[]).map(p => (
                            <Button
                                key={p}
                                variant={'ghost'}
                                size="sm"
                                className={cn(
                                    "h-8 px-4 rounded-lg text-xs font-semibold transition-all duration-300",
                                    period === p
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                                onClick={() => setPeriod(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-8">
                        {/* Left Column: Stats */}
                        <div className="flex flex-col gap-6">
                            <div className='flex flex-col items-center justify-center p-8 rounded-2xl bg-muted/30 border shadow-inner'>
                                <p className='text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1'><T textKey="currentTemp" /></p>
                                <div className="flex items-start">
                                    <span className="text-7xl font-bold text-foreground">
                                        {weatherData.current.temperature}
                                    </span>
                                    <span className="text-3xl text-muted-foreground mt-2">°C</span>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mt-6 w-full px-4'>
                                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-background border shadow-sm">
                                        <div className="flex items-center gap-2 text-chart-2">
                                            <Droplets className="size-4" />
                                            <span className="text-xs font-bold uppercase"><T textKey="humidity" /></span>
                                        </div>
                                        <span className='text-lg font-mono text-foreground'>{weatherData.current.humidity}%</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-background border shadow-sm">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Wind className="size-4" />
                                            <span className="text-xs font-bold uppercase"><T textKey="wind" /></span>
                                        </div>
                                        <span className='text-lg font-mono text-foreground'>{weatherData.current.windSpeed} <span className="text-xs text-muted-foreground">km/h</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><CloudRain className="size-24 text-primary" /></div>
                                <p className="text-xs font-bold text-primary/80 uppercase tracking-widest flex items-center gap-2 z-10">
                                    <TrendingUp className="size-3" /> <T textKey="rainfall" /> ({period === '7D' ? translatedText.last7Days : periodLabel[period]})
                                </p>
                                <p className="text-4xl font-bold text-foreground mt-2 z-10">{totalRainfall?.toFixed(1)} <span className="text-lg text-muted-foreground">mm</span></p>
                            </div>
                        </div>

                        {/* Right Column: Chart */}
                        <div className="h-[320px] rounded-2xl bg-card p-4 border relative">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted))_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none rounded-2xl" />

                            {chartLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-primary size-10" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            stroke="hsl(var(--chart-2))"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}°`}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="hsl(var(--primary))"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={<CustomTooltip />}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="avgTemp"
                                            name="Avg Temp"
                                            stroke="hsl(var(--chart-2))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTemp)"
                                        />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="precipitation"
                                            name="Rain"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRain)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
