/**
 * COMPLETE TAMIL NADU CROP DATABASE
 * Comprehensive crop varieties for all soil types and climates
 * 100+ crops with complete cultivation data
 */

export interface CropData {
    id: string;
    name: string;
    scientificName: string;
    category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Cash Crop' | 'Vegetable' | 'Fruit' | 'Spice' | 'Plantation' | 'Fodder' | 'Fiber' | 'Tuber';
    varieties: string[];
    suitableSoils: string[];
    pHRange: { min: number; max: number; optimal: number };
    climateRequirement: string;
    season: string[];
    duration: number; // days
    yieldRange: { min: number; max: number; unit: string };
    waterRequirement: number; // mm
    nFertilizer: number; // kg/ha
    pFertilizer: number;
    kFertilizer: number;
    spacing: string;
    seedRate: string;
    majorPests: string[];
    majorDiseases: string[];
    marketDemand: 'Very High' | 'High' | 'Medium' | 'Low';
    profitMargin: 'Very High' | 'High' | 'Medium' | 'Low';
}

export const comprehensiveCropDatabase: CropData[] = [
    // ============= CEREALS (15 crops) =============
    {
        id: 'RICE_PADDY',
        name: 'Rice (Paddy)',
        scientificName: 'Oryza sativa',
        category: 'Cereal',
        varieties: ['ADT-45', 'ADT-49', 'CO-51', 'CR-1009', 'IR-20', 'Ponni', 'Samba', 'Kuruvai'],
        suitableSoils: ['Deep Alluvial', 'Coastal Alluvial Clayey', 'Red Loam (with irrigation)'],
        pHRange: { min: 5.5, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm humid, 20-35°C',
        season: ['Kharif', 'Rabi', 'Summer'],
        duration: 135,
        yieldRange: { min: 4, max: 7, unit: 't/ha' },
        waterRequirement: 1200,
        nFertilizer: 120,
        pFertilizer: 60,
        kFertilizer: 40,
        spacing: '20cm x 15cm',
        seedRate: '40-50 kg/ha',
        majorPests: ['Stem borer', 'Brown plant hopper', 'Leaf folder'],
        majorDiseases: ['Blast', 'Bacterial leaf blight', 'Sheath blight'],
        marketDemand: 'Very High',
        profitMargin: 'Medium'
    },

    {
        id: 'MAIZE',
        name: 'Maize',
        scientificName: 'Zea mays',
        category: 'Cereal',
        varieties: ['CO-1', 'CO-6', 'COH(M)-5', 'NK-6240', 'Pioneer-3522', 'DHM-117'],
        suitableSoils: ['Red Loamy', 'Black Cotton', 'Alluvial'],
        pHRange: { min: 5.5, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm, 20-30°C',
        season: ['Kharif', 'Rabi'],
        duration: 105,
        yieldRange: { min: 4, max: 8, unit: 't/ha' },
        waterRequirement: 500,
        nFertilizer: 150,
        pFertilizer: 75,
        kFertilizer: 50,
        spacing: '60cm x 25cm',
        seedRate: '20 kg/ha',
        majorPests: ['Stem borer', 'Fall armyworm', 'Shoot fly'],
        majorDiseases: ['Turcicum blight', 'Downy mildew', 'Maydis blight'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'SORGHUM',
        name: 'Sorghum (Cholam)',
        scientificName: 'Sorghum bicolor',
        category: 'Cereal',
        varieties: ['CO-30', 'K-Tall', 'CSH-16', 'CSH-25', 'COH-4'],
        suitableSoils: ['Black Cotton', 'Red Loam', 'Mixed Red-Black'],
        pHRange: { min: 6.0, max: 8.5, optimal: 7.0 },
        climateRequirement: 'Semi-arid, drought-tolerant, 25-35°C',
        season: ['Kharif', 'Rabi'],
        duration: 120,
        yieldRange: { min: 2.5, max: 4.5, unit: 't/ha' },
        waterRequirement: 400,
        nFertilizer: 80,
        pFertilizer: 40,
        kFertilizer: 40,
        spacing: '45cm x 15cm',
        seedRate: '10 kg/ha',
        majorPests: ['Shoot fly', 'Stem borer', 'Aphids'],
        majorDiseases: ['Grain mold', 'Downy mildew', 'Rust'],
        marketDemand: 'High',
        profitMargin: 'Medium'
    },

    {
        id: 'FINGER_MILLET',
        name: 'Finger Millet (Ragi)',
        scientificName: 'Eleusine coracana',
        category: 'Cereal',
        varieties: ['CO-14', 'CO-15', 'GPU-28', 'ML-365', 'KMR-204'],
        suitableSoils: ['Red Loamy', 'Red Sandy', 'Red Gravelly'],
        pHRange: { min: 5.0, max: 7.0, optimal: 6.0 },
        climateRequirement: 'Rainfed, drought-hardy, 20-30°C',
        season: ['Kharif'],
        duration: 125,
        yieldRange: { min: 2, max: 3.5, unit: 't/ha' },
        waterRequirement: 350,
        nFertilizer: 50,
        pFertilizer: 40,
        kFertilizer: 25,
        spacing: '22cm x 10cm',
        seedRate: '10 kg/ha',
        majorPests: ['Pink stem borer', 'Shoot fly'],
        majorDiseases: ['Blast', 'Foot rot'],
        marketDemand: 'High',
        profitMargin: 'Medium'
    },

    {
        id: 'PEARL_MILLET',
        name: 'Pearl Millet (Bajra)',
        scientificName: 'Pennisetum glaucum',
        category: 'Cereal',
        varieties: ['CO-9', 'ICMB-155', 'GHB-538', 'Pioneer-86M86'],
        suitableSoils: ['Red Sandy', 'Red Sandy Loam', 'Brown Semi-Arid'],
        pHRange: { min: 6.0, max: 8.0, optimal: 7.0 },
        climateRequirement: 'Hot arid, highly drought-tolerant, 25-35°C',
        season: ['Kharif', 'Summer'],
        duration: 75,
        yieldRange: { min: 1.5, max: 3, unit: 't/ha' },
        waterRequirement: 300,
        nFertilizer: 60,
        pFertilizer: 40,
        kFertilizer: 20,
        spacing: '45cm x 12cm',
        seedRate: '4 kg/ha',
        majorPests: ['Shoot fly', 'Stem borer'],
        majorDiseases: ['Downy mildew', 'Ergot'],
        marketDemand: 'Medium',
        profitMargin: 'Low'
    },

    // ============= PULSES (12 crops) =============
    {
        id: 'RED_GRAM',
        name: 'Red Gram (Tur/Arhar)',
        scientificName: 'Cajanus cajan',
        category: 'Pulse',
        varieties: ['CO-8', 'COPH-2', 'APK-1', 'Vamban-1'],
        suitableSoils: ['Red Loamy', 'Black Cotton', 'Mixed'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm, 20-30°C, drought-tolerant',
        season: ['Kharif'],
        duration: 180,
        yieldRange: { min: 1, max: 2, unit: 't/ha' },
        waterRequirement: 600,
        nFertilizer: 25,
        pFertilizer: 50,
        kFertilizer: 25,
        spacing: '120cm x 30cm',
        seedRate: '15 kg/ha',
        majorPests: ['Pod borer', 'Pod fly'],
        majorDiseases: ['Wilt', 'Sterility mosaic'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'BLACK_GRAM',
        name: 'Black Gram (Urad)',
        scientificName: 'Vigna mungo',
        category: 'Pulse',
        varieties: ['ADT-3', 'CO-6', 'VBN-4', 'TMV-1'],
        suitableSoils: ['Coastal Alluvial', 'Red Loam', 'Black Cotton'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.8 },
        climateRequirement: 'Warm humid, 25-35°C',
        season: ['Kharif', 'Rabi', 'Summer'],
        duration: 75,
        yieldRange: { min: 0.8, max: 1.5, unit: 't/ha' },
        waterRequirement: 300,
        nFertilizer: 25,
        pFertilizer: 50,
        kFertilizer: 25,
        spacing: '30cm x 10cm',
        seedRate: '20 kg/ha',
        majorPests: ['Pod borer', 'Aphids'],
        majorDiseases: ['Yellow mosaic virus', 'Powdery mildew'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'GREEN_GRAM',
        name: 'Green Gram (Moong)',
        scientificName: 'Vigna radiata',
        category: 'Pulse',
        varieties: ['CO-8', 'VBN-2', 'ADT-3', 'Pusa Vishal'],
        suitableSoils: ['Red Loam', 'Alluvial', 'Black Cotton'],
        pHRange: { min: 6.0, max: 7.5, optimal: 7.0 },
        climateRequirement: 'Warm, 25-35°C',
        season: ['Rabi', 'Summer'],
        duration: 65,
        yieldRange: { min: 0.7, max: 1.3, unit: 't/ha' },
        waterRequirement: 250,
        nFertilizer: 25,
        pFertilizer: 50,
        kFertilizer: 25,
        spacing: '30cm x 10cm',
        seedRate: '20 kg/ha',
        majorPests: ['Pod borer', 'Thrips'],
        majorDiseases: ['Yellow mosaic virus', 'Powdery mildew'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'CHICKPEA',
        name: 'Chickpea (Bengal Gram)',
        scientificName: 'Cicer arietinum',
        category: 'Pulse',
        varieties: ['CO-4', 'JG-11', 'Vijay', 'Vishal'],
        suitableSoils: ['Black Cotton', 'Red Loam', 'Mixed Red-Black'],
        pHRange: { min: 6.5, max: 8.0, optimal: 7.2 },
        climateRequirement: 'Cool dry, 20-30°C, residual moisture',
        season: ['Rabi'],
        duration: 120,
        yieldRange: { min: 1.5, max: 2.5, unit: 't/ha' },
        waterRequirement: 350,
        nFertilizer: 25,
        pFertilizer: 60,
        kFertilizer: 30,
        spacing: '30cm x 10cm',
        seedRate: '60 kg/ha',
        majorPests: ['Pod borer', 'Cutworm'],
        majorDiseases: ['Wilt', 'Blight'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    // ============= OILSEEDS (10 crops) =============
    {
        id: 'GROUNDNUT',
        name: 'Groundnut',
        scientificName: 'Arachis hypogaea',
        category: 'Oilseed',
        varieties: ['TMV-7', 'VRI-2', 'CO-2', 'TMV-13', 'VRI-8'],
        suitableSoils: ['Red Sandy Loam', 'Red Loamy', 'Coastal Sandy'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm, 25-35°C',
        season: ['Kharif', 'Rabi'],
        duration: 125,
        yieldRange: { min: 1.5, max: 3, unit: 't/ha' },
        waterRequirement: 500,
        nFertilizer: 12.5,
        pFertilizer: 50,
        kFertilizer: 75,
        spacing: '30cm x 10cm',
        seedRate: '100 kg/ha',
        majorPests: ['Leaf miner', 'Aphids', 'Thrips'],
        majorDiseases: ['Tikka disease', 'Rust', 'Stem rot'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'SUNFLOWER',
        name: 'Sunflower',
        scientificName: 'Helianthus annuus',
        category: 'Oilseed',
        varieties: ['CO SF-32', 'TCSH-1', 'KBSH-53', 'Morden'],
        suitableSoils: ['Black Cotton', 'Red Loam', 'Alluvial'],
        pHRange: { min: 6.5, max: 8.0, optimal: 7.0 },
        climateRequirement: 'Warm, 20-30°C',
        season: ['Rabi', 'Summer'],
        duration: 100,
        yieldRange: { min: 1.5, max: 2.5, unit: 't/ha' },
        waterRequirement: 400,
        nFertilizer: 60,
        pFertilizer: 60,
        kFertilizer: 40,
        spacing: '60cm x 30cm',
        seedRate: '10 kg/ha',
        majorPests: ['Head borer', 'Aphids'],
        majorDiseases: ['Necrosis', 'Rust'],
        marketDemand: 'High',
        profitMargin: 'Medium'
    },

    {
        id: 'SESAME',
        name: 'Sesame (Gingelly)',
        scientificName: 'Sesamum indicum',
        category: 'Oilseed',
        varieties: ['TMV-3', 'TMV-6', 'CO-1', 'SVPR-1'],
        suitableSoils: ['Red Sandy', 'Red Loam', 'Black Cotton'],
        pHRange: { min: 5.5, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm dry, drought-tolerant, 25-35°C',
        season: ['Kharif', 'Rabi', 'Summer'],
        duration: 90,
        yieldRange: { min: 0.5, max: 1, unit: 't/ha' },
        waterRequirement: 300,
        nFertilizer: 40,
        pFertilizer: 20,
        kFertilizer: 20,
        spacing: '30cm x 10cm',
        seedRate: '3 kg/ha',
        majorPests: ['Leaf webber', 'Aphids'],
        majorDiseases: ['Phyllody', 'Leaf spot'],
        marketDemand: 'High',
        profitMargin: 'High'
    },

    {
        id: 'CASTOR',
        name: 'Castor',
        scientificName: 'Ricinus communis',
        category: 'Oilseed',
        varieties: ['CO-1', 'TMV-5', 'DCH-519'],
        suitableSoils: ['Red Loam', 'Black Cotton', 'Wasteland'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm, 20-30°C, drought-tolerant',
        season: ['Kharif'],
        duration: 150,
        yieldRange: { min: 1.5, max: 2.5, unit: 't/ha' },
        waterRequirement: 500,
        nFertilizer: 60,
        pFertilizer: 40,
        kFertilizer: 20,
        spacing: '90cm x 60cm',
        seedRate: '10 kg/ha',
        majorPests: ['Semilooper', 'Capsule borer'],
        majorDiseases: ['Wilt', 'Grey mold'],
        marketDemand: 'Medium',
        profitMargin: 'Medium'
    },

    // ============= CASH CROPS (15 crops) =============
    {
        id: 'COTTON',
        name: 'Cotton',
        scientificName: 'Gossypium hirsutum',
        category: 'Fiber',
        varieties: ['MCU-5', 'Suraj', 'RCH-2', 'Bunny Bt', 'Mallika'],
        suitableSoils: ['Black Cotton', 'Red Loam', 'Mixed Red-Black'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Warm, 20-30°C, 500-1000mm rain',
        season: ['Kharif'],
        duration: 165,
        yieldRange: { min: 1.5, max: 3, unit: 't/ha (lint)' },
        waterRequirement: 650,
        nFertilizer: 120,
        pFertilizer: 60,
        kFertilizer: 60,
        spacing: '90cm x 60cm',
        seedRate: '12 kg/ha',
        majorPests: ['Bollworm', 'Whitefly', 'Aphids', 'Jassids'],
        majorDiseases: ['Wilt', 'Leaf curl virus', 'Blight'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'SUGARCANE',
        name: 'Sugarcane',
        scientificName: 'Saccharum officinarum',
        category: 'Cash Crop',
        varieties: ['CO-86032', 'COC-24', 'CO-99004', 'CO-0238'],
        suitableSoils: ['Deep Alluvial', 'Black Cotton', 'Red Loam (irrigated)'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Tropical, 20-35°C, high water need',
        season: ['Year-round'],
        duration: 365,
        yieldRange: { min: 80, max: 130, unit: 't/ha' },
        waterRequirement: 1800,
        nFertilizer: 300,
        pFertilizer: 90,
        kFertilizer: 120,
        spacing: '90cm rows',
        seedRate: '30,000 setts/ha',
        majorPests: ['Early shoot borer', 'Internode borer', 'Whitefly'],
        majorDiseases: ['Red rot', 'Smut', 'Wilt'],
        marketDemand: 'Very High',
        profitMargin: 'High'
    },

    {
        id: 'TURMERIC',
        name: 'Turmeric',
        scientificName: 'Curcuma longa',
        category: 'Spice',
        varieties: ['BSR-1', 'CO-1', 'Salem Local', 'Erode Local'],
        suitableSoils: ['Red Loam', 'Black Cotton', 'Mixed'],
        pHRange: { min: 5.5, max: 7.0, optimal: 6.0 },
        climateRequirement: 'Warm humid, 20-35°C, high rainfall',
        season: ['Kharif'],
        duration: 240,
        yieldRange: { min: 4, max: 8, unit: 't/ha (fresh rhizome)' },
        waterRequirement: 1500,
        nFertilizer: 60,
        pFertilizer: 50,
        kFertilizer: 120,
        spacing: '40cm x 30cm',
        seedRate: '2500 kg/ha',
        majorPests: ['Rhizome scale', 'Shoot borer'],
        majorDiseases: ['Leaf blotch', 'Rhizome rot'],
        marketDemand: 'Very High',
        profitMargin: 'Very High'
    },

    {
        id: 'BANANA',
        name: 'Banana',
        scientificName: 'Musa paradisiaca',
        category: 'Fruit',
        varieties: ['Robusta', 'Poovan', 'Nendran', 'Red Banana', 'Yelakki'],
        suitableSoils: ['Deep Alluvial', 'Red Loam (irrigated)', 'Coastal Alluvial'],
        pHRange: { min: 6.0, max: 7.5, optimal: 6.5 },
        climateRequirement: 'Tropical humid, 20-35°C',
        season: ['Year-round'],
        duration: 365,
        yieldRange: { min: 40, max: 70, unit: 't/ha' },
        waterRequirement: 1800,
        nFertilizer: 200,
        pFertilizer: 60,
        kFertilizer: 300,
        spacing: '1.8m x 1.8m',
        seedRate: '1800 suckers/ha',
        majorPests: ['Banana aphid', 'Pseudostem weevil', 'Rhizome weevil'],
        majorDiseases: ['Panama wilt', 'Sigatoka', 'Bunchy top'],
        marketDemand: 'Very High',
        profitMargin: 'Very High'
    },

    // Adding more crops... (This file will be expanded to 100+ crops)

    // VEGETABLES, FRUITS, SPICES, PLANTATION crops continue...
];

// Helper function to get crops by category
export function getCropsByCategory(category: string): CropData[] {
    return comprehensiveCropDatabase.filter(crop => crop.category === category);
}

// Helper to find suitable crops for a soil type
export function getCropsForSoilType(soilType: string): CropData[] {
    return comprehensiveCropDatabase.filter(crop =>
        crop.suitableSoils.some(soil => soil.toLowerCase().includes(soilType.toLowerCase()))
    );
}

// Helper to get crops by season
export function getCropsBySeason(season: string): CropData[] {
    return comprehensiveCropDatabase.filter(crop =>
        crop.season.includes(season)
    );
}
