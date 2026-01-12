/**
 * AgMarkNet Data Transformation Utilities
 * 
 * Functions to transform and process agricultural market price data
 */

export interface MarketPricePoint {
    date: string;
    min_price: number;
    max_price: number;
    modal_price: number;
    market: string;
}

export interface ChartDataPoint {
    name: string; // Display label (e.g., "Jan 10")
    price: number; // Modal/average price
    date: string; // Full date
    min?: number; // Minimum price (optional)
    max?: number; // Maximum price (optional)
}

/**
 * Transform AgMarkNet API response to chart format
 */
export function transformToChartData(apiData: MarketPricePoint[]): ChartDataPoint[] {
    return apiData.map(point => {
        const date = new Date(point.date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return {
            name: `${monthNames[date.getMonth()]} ${date.getDate()}`,
            price: point.modal_price,
            date: point.date,
            min: point.min_price,
            max: point.max_price
        };
    });
}

/**
 * Calculate price statistics from market data
 */
export function calculatePriceStats(data: MarketPricePoint[]) {
    if (data.length === 0) {
        return {
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            trend: 'stable' as 'upward' | 'downward' | 'stable'
        };
    }

    const prices = data.map(d => d.modal_price);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate trend (compare first half vs second half)
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).map(d => d.modal_price);
    const secondHalf = data.slice(mid).map(d => d.modal_price);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'upward' | 'downward' | 'stable' = 'stable';
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) trend = 'upward';
    else if (changePercent < -5) trend = 'downward';

    return {
        avgPrice,
        minPrice,
        maxPrice,
        trend,
        changePercent: Math.round(changePercent * 10) / 10
    };
}

/**
 * Get best selling advice based on price data
 */
export function getBestSellingAdvice(data: MarketPricePoint[]) {
    if (data.length === 0) return null;

    // Find highest price point
    const highest = data.reduce((max, point) =>
        point.modal_price > max.modal_price ? point : max
        , data[0]);

    return {
        price: highest.modal_price,
        date: highest.date,
        market: highest.market,
        dayOfWeek: new Date(highest.date).toLocaleDateString('en-IN', { weekday: 'long' })
    };
}

/**
 * Format price for display
 */
export function formatPrice(price: number, unit: 'ton' | 'kg' | 'quintal' = 'quintal'): string {
    const formatted = price.toLocaleString('en-IN');

    switch (unit) {
        case 'kg':
            return `₹${Math.round(price / 100)}/kg`;
        case 'ton':
            return `₹${Math.round(price * 10)}/ton`;
        case 'quintal':
        default:
            return `₹${formatted}/quintal`;
    }
}
