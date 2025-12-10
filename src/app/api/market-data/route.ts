
import { NextRequest, NextResponse } from 'next/server';
import { allMarketData } from '@/ai/data/market-data';

// Helper function to generate dynamic dummy data if static data is not found
function generateDynamicDummyData(filters: { [key: string]: string | null }, fromDate?: string | null, toDate?: string | null) {
    const { commodity, state, district, market } = filters;
    if (!commodity || !state || !district) return [];

    const generatedData = [];
    // Base price per quintal between 2000 and 5000
    const basePricePerQuintal = 2000 + Math.random() * 3000;
    const numRecords = 10 + Math.floor(Math.random() * 10); // Generate 10 to 19 records
    const endDate = toDate ? new Date(toDate) : new Date();
    const startDate = fromDate ? new Date(fromDate) : new Date(new Date().setDate(endDate.getDate() - 30));

    for (let i = 0; i < numRecords; i++) {
        const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        const recordDate = new Date(randomTimestamp);
        
        const pricePerQuintal = basePricePerQuintal + (Math.random() - 0.5) * 400; // Fluctuate price
        generatedData.push({
            date: recordDate.toISOString().split('T')[0],
            price: parseFloat(pricePerQuintal.toFixed(2)),
            commodity: commodity,
            state: state,
            district: district,
            market: market || `${district} Main Market`,
        });
    }

    return generatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


// Helper function to filter dummy data
function filterData(filters: { [key: string]: string | null }, fromDate?: string | null, toDate?: string | null) {
  let records = allMarketData;

  const hasSpecificFilters = filters.commodity || filters.state || filters.district || filters.market;

  if (hasSpecificFilters) {
      if (filters.commodity) {
        records = records.filter(d => d.commodity.toLowerCase() === filters.commodity?.toLowerCase());
      }
      if (filters.state) {
        records = records.filter(d => d.state.toLowerCase() === filters.state?.toLowerCase());
      }
      if (filters.district) {
        records = records.filter(d => d.district.toLowerCase() === filters.district?.toLowerCase());
      }
      if (filters.market) {
        records = records.filter(d => d.market.toLowerCase().includes(filters.market?.toLowerCase() ?? ''));
      }
  }

  if (fromDate) {
    records = records.filter(d => new Date(d.date) >= new Date(fromDate));
  }
  if (toDate) {
    records = records.filter(d => new Date(d.date) <= new Date(toDate));
  }

  // If no records are found after filtering static data, generate dynamic ones.
  if (records.length === 0 && hasSpecificFilters) {
      records = generateDynamicDummyData(filters, fromDate, toDate);
  }
  
  // Prices are per quintal, so multiply by 10 for per ton
  return records.map(record => ({
    date: record.date,
    price: record.price * 10,
    minPrice: (record.price * 0.95) * 10, // Dummy min/max
    maxPrice: (record.price * 1.05) * 10,
    commodity: record.commodity,
    variety: 'N/A',
    state: record.state,
    district: record.district,
    market: record.market,
  }));
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const commodity = searchParams.get('commodity');
  const state = searchParams.get('state');
  const district = searchParams.get('district');
  const market = searchParams.get('market');
  
  const toDate = searchParams.get('toDate') || new Date().toISOString().split('T')[0];
  const defaultFromDate = new Date();
  defaultFromDate.setDate(defaultFromDate.getDate() - 30);
  const fromDate = searchParams.get('fromDate') || defaultFromDate.toISOString().split('T')[0];

  const apiKeys = [
    process.env.AGMARKNET_API_KEY,
    process.env.AGMARKNET_API_KEY_2,
    process.env.AGMARKNET_API_KEY_3
  ].filter(Boolean) as string[];

  const filters = { commodity, state, district, market };
  
  const fallbackResponse = () => {
    const data = filterData(filters, fromDate, toDate);
    return NextResponse.json({ data });
  };

  if (apiKeys.length === 0 || !apiKeys[0]) {
    return fallbackResponse();
  }
  
  for (const apiKey of apiKeys) {
    const baseUrl = 'https://api.data.gov.in/agmarknet/records';
    const params = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      offset: '0',
      limit: '500',
    });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(`filters[${key}]`, value);
      }
    });
  
    // Agmarknet API requires a date filter, so we ensure it's always present.
    const formattedFromDate = new Date(fromDate).toISOString().split('T')[0];
    params.append(`filters[arrival_date]`, formattedFromDate);
    
    try {
      console.log(`Trying Agmarknet API key ending in ...${apiKey.slice(-4)}`);
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      
      const text = await response.text();
      
      if (!response.ok || text.trim().startsWith('<') || text.trim() === "Not Found") {
          console.warn(`Agmarknet API key ending in ...${apiKey.slice(-4)} failed or returned non-JSON response. Trying next key.`);
          continue; // Try the next key
      }

      const data = JSON.parse(text);
      let records = data.records || [];

      if (records.length === 0) {
         // If no records are found, we'll let the loop finish and fall back to dummy data
         // This ensures that if one key returns no data but another might, we try them all.
      }

      if (toDate) {
          records = records.filter((r: any) => new Date(r.arrival_date) <= new Date(toDate));
      }

      // If we got records, we can return them
      if (records.length > 0) {
          console.log(`Successfully fetched ${records.length} records with key ...${apiKey.slice(-4)}`);
          const formattedData = records.map((record: any) => ({
              date: record.arrival_date,
              price: (parseFloat(record.modal_price) || 0) * 10,
              minPrice: (parseFloat(record.min_price) || 0) * 10,
              maxPrice: (parseFloat(record.max_price) || 0) * 10,
              commodity: record.commodity,
              variety: record.variety,
              state: record.state,
              district: record.district,
              market: record.market,
          }));

          return NextResponse.json({ data: formattedData });
      }
      
    } catch (error) {
      console.error(`Error fetching from Agmarknet with key ...${apiKey.slice(-4)}`, error);
      continue; // On any other fetch error, try the next key
    }
  }

  // If all keys fail or return no records, fall back to dummy data
  return fallbackResponse();
}
