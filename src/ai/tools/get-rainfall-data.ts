'use server';

interface RainfallData {
    annualRainfallMm: number;
    category: '<500mm' | '500-1000mm' | '>1000mm';
    raw: any;
}

export async function getAnnualRainfall(lat: number, lon: number): Promise<RainfallData> {
    try {
        // Calculate dates for the last full year
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);

        // Format dates as YYYY-MM-DD
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        const start = formatDate(startDate);
        const end = formatDate(endDate);

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=precipitation_sum&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.daily || !data.daily.precipitation_sum) {
            throw new Error('No precipitation data found');
        }

        // Sum up daily precipitation
        const totalRainfall = data.daily.precipitation_sum.reduce((acc: number, val: number | null) => acc + (val || 0), 0);
        const roundedRainfall = Math.round(totalRainfall);

        // Determine category
        let category: RainfallData['category'] = '500-1000mm';
        if (roundedRainfall < 500) {
            category = '<500mm';
        } else if (roundedRainfall > 1000) {
            category = '>1000mm';
        }

        return {
            annualRainfallMm: roundedRainfall,
            category,
            raw: data
        };

    } catch (error) {
        console.error('Failed to fetch rainfall data:', error);
        // Fallback to a safe default (medium rainfall)
        return {
            annualRainfallMm: 750, // Approximation
            category: '500-1000mm',
            raw: null
        };
    }
}
