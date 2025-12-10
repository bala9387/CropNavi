'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeatherData } from '@/ai/tools/get-weather-data';
import { Loader2, CloudSun, MapPin, Wind, Droplets, CloudRain, CalendarDays } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';

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
        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
          <p className="font-bold">{format(new Date(data.date), 'EEE, MMM d')}</p>
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {data.minTemp !== undefined && <><span className="font-semibold text-blue-500">Min:</span><span>{data.minTemp.toFixed(1)}°C</span></>}
            {data.maxTemp !== undefined && <><span className="font-semibold text-red-500">Max:</span><span>{data.maxTemp.toFixed(1)}°C</span></>}
            {data.avgTemp !== undefined && <><span className="font-semibold text-orange-500">Avg:</span><span>{data.avgTemp.toFixed(1)}°C</span></>}
            {data.precipitation !== undefined && <><span className="font-semibold text-sky-500">Rain:</span><span>{data.precipitation.toFixed(1)}mm</span></>}
          </div>
        </div>
      );
    }
  
    return null;
};

type Period = '7D' | '1M' | '6M' | '1Y';

export function WeatherCard() {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [historicalData, setHistoricalData] = useState<ChartableData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [period, setPeriod] = useState<Period>('7D');
    const { toast } = useToast();

    // Fetch initial forecast data
    useEffect(() => {
        const fetchInitialWeather = async () => {
            setIsLoading(true);
            try {
                // Using a default location (e.g., Ranchi, Jharkhand)
                const data = await getWeatherData({ latitude: 23.3441, longitude: 85.3096 });
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
    }, [toast]);

    // Fetch historical data when period changes
    useEffect(() => {
        const fetchHistoricalWeather = async () => {
            if (period === '7D') {
                setHistoricalData(null); // Use forecast data for 7D
                return;
            }

            setIsFetchingHistory(true);
            const endDate = new Date();
            let startDate: Date;

            if (period === '1M') startDate = subDays(endDate, 30);
            else if (period === '6M') startDate = subDays(endDate, 180);
            else startDate = subDays(endDate, 365);

            try {
                const data = await getWeatherData({ 
                    latitude: 23.3441, 
                    longitude: 85.3096,
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
    }, [period, toast]);


    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <CloudSun className="text-primary" />
                        Weather & Climate Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary size-10" />
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

    const periodLabel = {
      '7D': 'Last 7 Days',
      '1M': 'Last 30 Days',
      '6M': 'Last 6 Months',
      '1Y': 'Last Year'
    }

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <CloudSun className="text-primary" />
                        Weather & Climate Data
                    </CardTitle>
                    <CardDescription className='flex items-center gap-2 mt-1'>
                        <MapPin className='size-4'/>
                        Ranchi, Jharkhand
                    </CardDescription>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    {(['7D', '1M', '6M', '1Y'] as Period[]).map(p => (
                        <Button 
                            key={p} 
                            variant={period === p ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 px-3"
                            onClick={() => setPeriod(p)}
                        >
                            {p}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                    <div className="flex flex-col justify-between p-4 rounded-lg bg-muted/50 border gap-4">
                        <div className='text-center'>
                            <p className='text-sm text-muted-foreground'>Now</p>
                            <p className="text-5xl font-bold">{weatherData.current.temperature}°C</p>
                            <div className='flex justify-center gap-4 text-muted-foreground mt-2'>
                                <div className="flex items-center gap-1.5" title="Humidity">
                                    <Droplets className="size-4" />
                                    <span className='text-sm'>{weatherData.current.humidity}%</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Wind Speed">
                                    <Wind className="size-4" />
                                    <span className='text-sm'>{weatherData.current.windSpeed} km/h</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center border-t pt-4">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><CloudRain className="size-4" /> Total Rainfall ({periodLabel[period]})</p>
                            <p className="text-3xl font-bold">{totalRainfall?.toFixed(1)} mm</p>
                        </div>
                    </div>
                    <div className="h-[200px]">
                        {chartLoading ? (
                             <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-primary size-8" />
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData ?? []}>
                                 <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}°C`} />
                                 <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}mm`} />
                                <Tooltip
                                    cursor={{fill: 'hsl(var(--accent))', opacity: 0.2}}
                                    content={<CustomTooltip />}
                                />
                                <Bar yAxisId="left" dataKey="avgTemp" name="Avg Temp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="precipitation" name="Rain" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
