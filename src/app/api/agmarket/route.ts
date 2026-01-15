import { NextRequest, NextResponse } from 'next/server';

/**
 * AgMarkNet Market Price API Proxy
 * 
 * Fetches real agricultural commodity prices from India's government sources
 * Uses: data.gov.in commodity price datasets
 * Fallback: Simulated data if API unavailable
 */

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Commodity name mapping from our UI names to API names
const commodityMapping: { [key: string]: string } = {
    'Paddy (Rice)': 'Paddy',
    'Rice': 'Rice',
    'Wheat': 'Wheat',
    'Maize (Corn)': 'Maize',
    'Sugarcane': 'Sugarcane',
    'Cotton': 'Cotton',
    'Groundnut (Peanut)': 'Groundnut',
    'Sunflower': 'Sunflower',
    'Soybean': 'Soybean',
    'Onion': 'Onion',
    'Potato': 'Potato',
    'Tomato': 'Tomato',
    'Turmeric': 'Turmeric',
    'Chilli': 'Chilli',
    'Garlic': 'Garlic',
    'Ginger': 'Ginger',
    'Coconut': 'Coconut',
    'Banana': 'Banana',
    'Mango': 'Mango',
    'Orange': 'Orange',
    'Apple': 'Apple',
    'Grapes': 'Grapes',
    // Add more mappings as needed
};

interface PriceDataPoint {
    date: string;
    min_price: number;
    max_price: number;
    modal_price: number;
    market: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const commodity = searchParams.get('commodity') || 'Paddy';
        const state = searchParams.get('state') || 'Tamil Nadu';
        const district = searchParams.get('district') || '';
        const market = searchParams.get('market') || '';

        // Create cache key
        const cacheKey = `${commodity}-${state}-${district}-${market}`;

        // Check cache
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                data: cached.data,
                source: 'cache',
                cached: true
            });
        }

        // Map commodity name
        const apiCommodity = commodityMapping[commodity] || commodity;

        // Try to fetch from data.gov.in
        // Public Demo Key for data.gov.in
        const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

        // Construct API URL
        // Note: The API uses specific casing sometimes, but usually handles standard casing.
        const apiUrl = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=20&filters[state]=${encodeURIComponent(state)}&filters[commodity]=${encodeURIComponent(apiCommodity)}`;

        let priceData: PriceDataPoint[] = [];
        let source = 'agmarknet-simulated';

        try {
            // Only fetch if we're in a real environment (or testing), preventing build timeouts if external is blocked
            const response = await fetch(apiUrl, { next: { revalidate: 3600 } });

            if (response.ok) {
                const result = await response.json();
                if (result.records && result.records.length > 0) {
                    priceData = result.records.map((record: any) => ({
                        date: record.arrival_date || new Date().toISOString().split('T')[0],
                        min_price: Number(record.min_price),
                        max_price: Number(record.max_price),
                        modal_price: Number(record.modal_price),
                        market: record.market
                    }));
                    source = 'agmarknet-live';
                }
            }
        } catch (apiError) {
            console.warn("Real API fetch failed, using realistic fallback", apiError);
        }

        // If API returned no data (or failed), use Realistic Generator
        if (priceData.length === 0) {
            priceData = generateRealisticPriceData(apiCommodity, state, district, market);
        }

        // Cache the result
        cache.set(cacheKey, {
            data: priceData,
            timestamp: Date.now()
        });

        return NextResponse.json({
            success: true,
            data: priceData,
            source: source,
            commodity: apiCommodity,
            state,
            district,
            market,
            cached: false
        });

    } catch (error) {
        console.error('AgMarket API Error:', error);

        // Fallback to simulated data
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch market data',
            data: generateFallbackData(),
            source: 'fallback'
        }, { status: 500 });
    }
}

function generateRealisticPriceData(
    commodity: string,
    state: string,
    district: string,
    market: string
): PriceDataPoint[] {
    // Base prices per quintal (100 kg) - VERIFIED 2025-26 MSP & Market Rates
    const basePrices: { [key: string]: { min: number; max: number } } = {
        // CEREALS (Kharif & Rabi)
        'Paddy': { min: 2450, max: 2650 }, // MSP Govt Procurement ~2545
        'Rice': { min: 3800, max: 4800 },
        'Wheat': { min: 2350, max: 2500 }, // MSP ₹2425
        'Maize': { min: 2000, max: 2400 },
        'Bajra': { min: 2700, max: 2850 }, // MSP ₹2775 (Pearl Millet)
        'Jowar': { min: 3600, max: 3800 }, // MSP ₹3699 (Sorghum Hybrid)
        'Ragi': { min: 4000, max: 4400 }, // Finger Millet
        'Barley': { min: 1900, max: 2060 }, // MSP ₹1980

        // PULSES (High protein crops)
        'Arhar (Tur/Red Gram)': { min: 7900, max: 8100 }, // MSP ₹8000
        'Tur': { min: 7900, max: 8100 }, // Alias for Arhar
        'Moong': { min: 8650, max: 8900 }, // MSP ₹8768 (Green Gram)
        'Green Gram (Moong)': { min: 8650, max: 8900 },
        'Urad': { min: 7700, max: 7900 }, // MSP ₹7800 (Black Gram)
        'Black Gram (Urad)': { min: 7700, max: 7900 },
        'Lentil (Masur)': { min: 6600, max: 6800 }, // MSP ₹6700
        'Masur': { min: 6600, max: 6800 },
        'Chickpea (Chana)': { min: 5550, max: 5750 }, // MSP ₹5650 (Gram)
        'Chana': { min: 5550, max: 5750 },
        'Gram': { min: 5550, max: 5750 },

        // OILSEEDS
        'Groundnut (Peanut)': { min: 7150, max: 7380 }, // MSP ₹7263
        'Groundnut': { min: 7150, max: 7380 },
        'Soybean': { min: 5200, max: 5450 }, // MSP ₹5328 (Yellow)
        'Sunflower': { min: 7000, max: 7500 },
        'Rapeseed \u0026 Mustard': { min: 5850, max: 6050 }, // MSP ₹5950
        'Mustard': { min: 5850, max: 6050 },
        'Safflower': { min: 5850, max: 6030 }, // MSP ₹5940
        'Sesamum (Sesame)': { min: 8600, max: 9000 },
        'Sesame': { min: 8600, max: 9000 },
        'Niger Seed': { min: 7800, max: 8200 },
        'Castor Seed': { min: 6700, max: 7300 },
        'Linseed': { min: 6500, max: 7000 },

        // CASH CROPS
        'Cotton': { min: 7600, max: 8200 }, // MSP Medium ₹7710, Long ₹8110
        'Jute': { min: 5500, max: 7500 }, // MSP ₹5650, Market volatile
        'Sugarcane': { min: 340, max: 380 }, // Fair Remunerative Price

        // VEGETABLES (Market rates - no MSP)
        'Onion': { min: 2500, max: 4500 }, // Big Onion volatile ~₹27-45/kg
        'Potato': { min: 2000, max: 3000 },
        'Tomato': { min: 2000, max: 5000 }, // High volatility ~₹20-50/kg
        'Brinjal (Eggplant)': { min: 1500, max: 3000 },
        'Cabbage': { min: 1200, max: 2000 },
        'Cauliflower': { min: 1500, max: 2500 },
        'Carrot': { min: 1800, max: 2800 },
        'Beetroot': { min: 1500, max: 2500 },
        'Lady Finger (Okra)': { min: 2000, max: 4000 },
        'Beans': { min: 2500, max: 4500 },
        'Cucumber': { min: 1500, max: 2500 },
        'Pumpkin': { min: 1000, max: 1800 },
        'Radish': { min: 1200, max: 2000 },
        'Spinach': { min: 1500, max: 2500 },
        'Drumstick (Moringa)': { min: 3000, max: 5000 },

        // FRUITS
        'Banana': { min: 1800, max: 2800 },
        'Mango': { min: 3000, max: 6000 }, // Seasonal variation
        'Apple': { min: 6000, max: 12000 }, // Premium varieties
        'Grapes': { min: 4000, max: 8000 },
        'Orange': { min: 2500, max: 4000 },
        'Papaya': { min: 1500, max: 2500 },
        'Guava': { min: 2000, max: 3500 },
        'Pomegranate': { min: 5000, max: 9000 },
        'Watermelon': { min: 800, max: 1500 },
        'Pineapple': { min: 2000, max: 3500 },
        'Jackfruit': { min: 1500, max: 2500 },

        // SPICES
        'Turmeric': { min: 8000, max: 10500 }, // Erode premium
        'Chilli': { min: 6000, max: 9000 },
        'Ginger': { min: 8000, max: 12000 },
        'Garlic': { min: 6000, max: 10000 },
        'Black Pepper': { min: 50000, max: 70000 }, // Per quintal
        'Cardamom': { min: 100000, max: 150000 }, // Premium spice
        'Coriander': { min: 7000, max: 9000 },
        'Cumin': { min: 15000, max: 25000 },
        'Fennel': { min: 15000, max: 20000 },
        'Fenugreek': { min: 6000, max: 8000 },

        // PLANTATION CROPS
        'Coconut': { min: 2800, max: 3800 }, // Per 100 nuts
        'Arecanut': { min: 35000, max: 50000 },
        'Cashew Nuts': { min: 12000, max: 18000 },
        'Coffee': { min: 8000, max: 12000 },
        'Tea': { min: 3000, max: 5000 },
        'Rubber': { min: 15000, max: 20000 },
        'Tamarind': { min: 6000, max: 9000 },
    };

    const priceRange = basePrices[commodity] || { min: 2000, max: 3000 };
    const data: PriceDataPoint[] = [];

    // Generate last 14 days of data
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some realistic variation
        const variation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
        const modalPrice = Math.round((priceRange.min + priceRange.max) / 2 * (1 + variation));
        const minPrice = Math.round(modalPrice * 0.95);
        const maxPrice = Math.round(modalPrice * 1.05);

        data.push({
            date: date.toISOString().split('T')[0],
            min_price: minPrice,
            max_price: maxPrice,
            modal_price: modalPrice,
            market: market || `${district || state} Market`
        });
    }

    return data;
}

function generateFallbackData(): PriceDataPoint[] {
    const data: PriceDataPoint[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            min_price: 2000 + Math.floor(Math.random() * 200),
            max_price: 2300 + Math.floor(Math.random() * 200),
            modal_price: 2150 + Math.floor(Math.random() * 200),
            market: 'Default Market'
        });
    }

    return data;
}
