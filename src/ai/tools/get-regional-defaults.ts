'use server';

interface RegionalDefaults {
    rainfall: string;
    soilType: string;
    primaryGoal: string;
    riskTolerance: string;
    fieldSize: number;
    recentCrop: string;
    fertilizer: string;
    irrigation: string;
    recentCropYear: string;
}

export async function getRegionalDefaults(lat: number, lon: number): Promise<RegionalDefaults> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Deterministic "random" based on location to be consistent
    const seed = Math.floor(lat * 1000 + lon * 1000);
    const random = (offset: number = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // Mock Logic for Tamil Nadu Region
    const rainfalls = ['<500mm', '500-1000mm', '>1000mm'];
    const soilTypes = ['sandy', 'clay', 'loam', 'silty', 'peaty'];
    const crops = ['Rice', 'Sugarcane', 'Turmeric', 'Coconut', 'Banana', 'Tapioca', 'Groundnut', 'Maize'];
    const irrigations = ['drip', 'flood', 'sprinkler', 'rainfed'];
    const goals = ['cash-crop', 'mixed', 'personal-consumption'];
    const fertilizers = ['organic', 'synthetic', 'mixed'];

    // TN is generally 500-1000mm or >1000mm in coastal/hilly
    const rainfallIndex = random(1) > 0.6 ? 2 : 1;
    // Soil varied
    const soilIndex = Math.floor(random(2) * soilTypes.length);
    const cropIndex = Math.floor(random(3) * crops.length);
    const irrigationIndex = Math.floor(random(4) * irrigations.length);

    return {
        rainfall: rainfalls[rainfallIndex],
        soilType: soilTypes[soilIndex],
        primaryGoal: goals[Math.floor(random(5) * goals.length)],
        riskTolerance: random(6) > 0.5 ? 'medium' : 'low',
        fieldSize: Math.floor(random(7) * 10) + 1, // 1-10 acres
        recentCrop: crops[cropIndex],
        fertilizer: fertilizers[Math.floor(random(8) * fertilizers.length)],
        irrigation: irrigations[irrigationIndex],
        recentCropYear: (new Date().getFullYear() - 1).toString()
    };
}
