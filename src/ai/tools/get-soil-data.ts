'use server';

async function fetchWithRetry(url: string, maxRetries = 3, baseDelay = 1000): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (response.ok) {
                return response;
            }

            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
                throw new Error(`Client error ${response.status}: ${response.statusText}`);
            }

            lastError = new Error(`Server error ${response.status}: ${response.statusText}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }

        // Exponential backoff: wait before retrying
        if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError || new Error('Failed to fetch after retries');
}

// Backup: Try OpenLandMap when SoilGrids fails
async function fetchFromOpenLandMap(lat: number, lon: number) {
    const url = `https://landgisapi.opengeohub.org/query/point?lon=${lon}&lat=${lat}&coll=sol`;

    try {
        const response = await fetchWithRetry(url, 2, 1000);
        const data = await response.json();

        // OpenLandMap returns different format - convert to SoilGrids format
        // Their layer names: sol_ph.h2o, sol_sand.wfraction, sol_clay.wfraction, etc.
        const converted = [
            {
                name: 'phh2o', depths: [
                    { label: '0-5cm', values: { mean: data['sol_ph.h2o_0..5cm_mean'] || 70 } },
                    { label: '5-15cm', values: { mean: data['sol_ph.h2o_5..15cm_mean'] || 70 } }
                ]
            },
            {
                name: 'clay', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_clay.wfraction_0..5cm_mean'] || 0.25) * 1000) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_clay.wfraction_5..15cm_mean'] || 0.25) * 1000) } }
                ]
            },
            {
                name: 'sand', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_sand.wfraction_0..5cm_mean'] || 0.40) * 1000) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_sand.wfraction_5..15cm_mean'] || 0.40) * 1000) } }
                ]
            },
            {
                name: 'silt', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_silt.wfraction_0..5cm_mean'] || 0.35) * 1000) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_silt.wfraction_5..15cm_mean'] || 0.35) * 1000) } }
                ]
            },
            {
                name: 'soc', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_organic.carbon_0..5cm_mean'] || 12) * 10) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_organic.carbon_5..15cm_mean'] || 10) * 10) } }
                ]
            },
            {
                name: 'nitrogen', depths: [
                    { label: '0-5cm', values: { mean: data['sol_nitrogen.total_0..5cm_mean'] || 110 } },
                    { label: '5-15cm', values: { mean: data['sol_nitrogen.total_5..15cm_mean'] || 100 } }
                ]
            },
            {
                name: 'cec', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_cec.clay_0..5cm_mean'] || 18) * 10) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_cec.clay_5..15cm_mean'] || 19) * 10) } }
                ]
            },
            {
                name: 'bdod', depths: [
                    { label: '0-5cm', values: { mean: Math.round((data['sol_bulkdens.fineearth_0..5cm_mean'] || 1350) / 10) } },
                    { label: '5-15cm', values: { mean: Math.round((data['sol_bulkdens.fineearth_5..15cm_mean'] || 1400) / 10) } }
                ]
            }
        ];

        return converted;
    } catch (error) {
        console.error('OpenLandMap also failed:', error);
        throw error;
    }
}

export async function getSoilData(lat: number, lon: number): Promise<{ data: any[], source: string }> {
    const properties = [
        'bdod', 'cec', 'clay', 'nitrogen', 'phh2o', 'sand', 'silt', 'soc'
    ];
    const depths = ['0-5cm', '5-15cm'];
    const values = ['mean'];

    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lon', lon.toString());
    properties.forEach(p => params.append('property', p));
    depths.forEach(d => params.append('depth', d));
    values.forEach(v => params.append('value', v));

    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?${params.toString()}`;

    // Try SoilGrids first
    try {
        const response = await fetchWithRetry(url, 3, 1000);
        const data = await response.json();
        console.log('✅ SoilGrids API success');
        return { data: data.layers, source: 'soilgrids' };
    } catch (soilGridsError) {
        console.warn('SoilGrids failed, trying OpenLandMap...', soilGridsError);

        // Try OpenLandMap backup
        try {
            const backupData = await fetchFromOpenLandMap(lat, lon);
            console.log('✅ OpenLandMap API success (backup)');
            return { data: backupData, source: 'openlandmap' };
        } catch (openLandMapError) {
            console.error('Both APIs failed:', openLandMapError);
            // Will use fallback in calling code
            throw new Error('All soil APIs unavailable');
        }
    }
}
