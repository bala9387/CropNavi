/**
 * COMPREHENSIVE TAMIL NADU SOIL TYPE DATABASE
 * Complete coverage of all major soil types with best crop recommendations
 * Based on TNAU, ICAR, and Tamil Nadu Soil Survey data
 */

export interface SoilTypeCropRecommendation {
    soilTypeName: string;
    scientificName: string;
    pHRange: { min: number; max: number; optimal: number };
    texture: string; // Clay%, Sand%, Silt%
    characteristics: string[];
    drainage: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
    nutrients: {
        nitrogen: 'High' | 'Medium' | 'Low';
        phosphorus: 'High' | 'Medium' | 'Low';
        potassium: 'High' | 'Medium' | 'Low';
        organicMatter: 'High' | 'Medium' | 'Low';
    };
    districts: string[]; // Where this soil type is found
    bestCrops: {
        crop: string;
        suitability: 'Excellent' | 'Very Good' | 'Good' | 'Moderate';
        expectedYield: string;
        season: string;
        waterRequirement: 'High' | 'Medium' | 'Low';
        reasons: string[];
    }[];
    avoidCrops: string[]; // Crops that don't do well
    improvements: string[]; // How to improve this soil
}

// Complete database of all Tamil Nadu soil types
export const tamilNaduSoilTypes: SoilTypeCropRecommendation[] = [
    // =================== RED SOILS ===================
    {
        soilTypeName: 'Red Loamy Soil',
        scientificName: 'Alfisols (Red Loam)',
        pHRange: { min: 6.0, max: 7.5, optimal: 6.8 },
        texture: '25-35% clay, 30-45% sand, 25-40% silt',
        characteristics: [
            'Well-drained',
            'Medium fertility',
            'Good for rainfed crops',
            'Red-brown color due to iron oxide',
            'Friable structure'
        ],
        drainage: 'Excellent',
        nutrients: {
            nitrogen: 'Medium',
            phosphorus: 'Low',
            potassium: 'Medium',
            organicMatter: 'Medium'
        },
        districts: ['Salem', 'Dharmapuri', 'Krishnagiri', 'Vellore', 'Tiruvannamalai', 'Villupuram'],
        bestCrops: [
            {
                crop: 'Cotton',
                suitability: 'Excellent',
                expectedYield: '1.8-2.5 tons/ha',
                season: 'Kharif (June-Oct)',
                waterRequirement: 'Medium',
                reasons: ['Deep rooting system suits well-drained soil', 'pH 6-7.5 ideal', 'Tolerates moderate fertility']
            },
            {
                crop: 'Groundnut',
                suitability: 'Excellent',
                expectedYield: '2-2.5 tons/ha',
                season: 'Kharif & Rabi',
                waterRequirement: 'Medium',
                reasons: ['Friable soil good for pod development', 'Well-aerated soil essential', 'Fixes nitrogen']
            },
            {
                crop: 'Maize',
                suitability: 'Very Good',
                expectedYield: '4-6 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Medium',
                reasons: ['Good drainage prevents waterlogging', 'Responds to organic matter', 'Short duration crop']
            },
            {
                crop: 'Finger Millet (Ragi)',
                suitability: 'Excellent',
                expectedYield: '2-3 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Low',
                reasons: ['Drought tolerant', 'Grows in low fertility', 'Traditional crop of red soil areas']
            },
            {
                crop: 'Tapioca',
                suitability: 'Very Good',
                expectedYield: '25-35 tons/ha',
                season: 'Year-round',
                waterRequirement: 'Medium',
                reasons: ['Tuber development in friable soil', 'Tolerates acidity', 'Good for marginal lands']
            }
        ],
        avoidCrops: ['Rice (needs heavy clay)', 'Sugarcane (needs more water retention)', 'Tea (needs more acidity)'],
        improvements: [
            'Add organic manure to increase fertility',
            'Apply phosphate fertilizers (low P)',
            'Lime application if pH < 6.0',
            'Mulching to retain moisture'
        ]
    },

    {
        soilTypeName: 'Red Sandy Soil',
        scientificName: 'Sandy Red Soil',
        pHRange: { min: 6.0, max: 7.0, optimal: 6.5 },
        texture: '15-25% clay, 45-60% sand, 20-30% silt',
        characteristics: [
            'Highly drained (too fast)',
            'Low water retention',
            'Low fertility',
            'Loose structure',
            'Prone to erosion'
        ],
        drainage: 'Excellent',
        nutrients: {
            nitrogen: 'Low',
            phosphorus: 'Low',
            potassium: 'Low',
            organicMatter: 'Low'
        },
        districts: ['Dharmapuri', 'Krishnagiri', 'Parts of Salem'],
        bestCrops: [
            {
                crop: 'Finger Millet (Ragi)',
                suitability: 'Excellent',
                expectedYield: '1.5-2.5 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Low',
                reasons: ['Extremely drought tolerant', 'Low nutrient requirements', 'Traditional crop']
            },
            {
                crop: 'Groundnut',
                suitability: 'Very Good',
                expectedYield: '1.5-2 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Medium',
                reasons: ['Sandy soil ideal for pod formation', 'Nitrogen fixing improves soil', 'Short duration']
            },
            {
                crop: 'Pearl Millet (Bajra)',
                suitability: 'Good',
                expectedYield: '1.5-2 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Low',
                reasons: ['Drought hardy', 'Tolerates poor fertility', 'Fast growing']
            },
            {
                crop: 'Sesame (Gingelly)',
                suitability: 'Good',
                expectedYield: '0.5-0.8 tons/ha',
                season: 'Kharif & Rabi',
                waterRequirement: 'Low',
                reasons: ['Drought tolerant', 'Short duration', 'High value oilseed']
            }
        ],
        avoidCrops: ['Rice', 'Sugarcane', 'Banana', 'All water-intensive crops'],
        improvements: [
            'Heavy organic manure application',
            'Green manuring with legumes',
            'Vermicompost to improve water retention',
            'Mulching is essential'
        ]
    },

    // =================== BLACK SOILS ===================
    {
        soilTypeName: 'Black Cotton Soil',
        scientificName: 'Vertisols (Black Regur)',
        pHRange: { min: 7.0, max: 8.5, optimal: 7.8 },
        texture: '40-60% clay, 15-30% sand, 20-30% silt',
        characteristics: [
            'Very high clay content',
            'Excellent water retention',
            'Cracks deeply when dry',
            'Self-plowing action',
            'Sticky when wet',
            'Very hard when dry'
        ],
        drainage: 'Poor',
        nutrients: {
            nitrogen: 'Low',
            phosphorus: 'Medium',
            potassium: 'High',
            organicMatter: 'Medium'
        },
        districts: ['Coimbatore', 'Madurai', 'Ramanathapuram', 'Virudhunagar', 'Parts of Salem'],
        bestCrops: [
            {
                crop: 'Cotton',
                suitability: 'Excellent',
                expectedYield: '2-3 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Medium',
                reasons: ['Traditional black soil crop', 'Deep roots penetrate cracking soil', 'High potassium beneficial']
            },
            {
                crop: 'Sorghum (Cholam)',
                suitability: 'Excellent',
                expectedYield: '3-4 tons/ha',
                season: 'Kharif & Rabi',
                waterRequirement: 'Low',
                reasons: ['Drought tolerant', 'Suits alkaline pH', 'Good for rainfed areas']
            },
            {
                crop: 'Chickpea (Bengal Gram)',
                suitability: 'Excellent',
                expectedYield: '1.5-2 tons/ha',
                season: 'Rabi',
                waterRequirement: 'Low',
                reasons: ['Fixes nitrogen', 'Residual moisture utilization', 'Alkaline tolerant']
            },
            {
                crop: 'Sunflower',
                suitability: 'Very Good',
                expectedYield: '1.5-2.5 tons/ha',
                season: 'Rabi',
                waterRequirement: 'Medium',
                reasons: ['Tolerates alkalinity', 'Short duration', 'High-value oilseed']
            },
            {
                crop: 'Safflower',
                suitability: 'Good',
                expectedYield: '1-1.5 tons/ha',
                season: 'Rabi',
                waterRequirement: 'Low',
                reasons: ['Extreme drought tolerance', 'Residual moisture crop', 'Deep rooted']
            }
        ],
        avoidCrops: ['Tea', 'Coffee', 'Acidic-loving crops', 'Crops requiring good drainage'],
        improvements: [
            'Deep plowing to improve drainage',
            'Gypsum application to improve structure',
            'Organic matter to prevent hardening',
            'Avoid over-irrigation'
        ]
    },

    // =================== ALLUVIAL SOILS ===================
    {
        soilTypeName: 'Deltaic Alluvium (Cauvery Delta)',
        scientificName: 'Alluvial Soil (Entisols/Inceptisols)',
        pHRange: { min: 6.8, max: 7.8, optimal: 7.2 },
        texture: '30-40% clay, 25-40% sand, 25-35% silt',
        characteristics: [
            'Highly fertile',
            'Rich in minerals',
            'Good moisture retention',
            'Silt-loam texture',
            'Annually renewed by flooding'
        ],
        drainage: 'Moderate',
        nutrients: {
            nitrogen: 'High',
            phosphorus: 'Medium',
            potassium: 'High',
            organicMatter: 'High'
        },
        districts: ['Thanjavur', 'Nagapattinam', 'Tiruvarur', 'Mayiladuthurai', 'Cuddalore'],
        bestCrops: [
            {
                crop: 'Rice (Paddy)',
                suitability: 'Excellent',
                expectedYield: '5-7 tons/ha',
                season: 'Kharif & Rabi',
                waterRequirement: 'High',
                reasons: ['Rice bowl of Tamil Nadu', 'Assured irrigation', 'Highest fertility', 'Perfect texture']
            },
            {
                crop: 'Sugarcane',
                suitability: 'Excellent',
                expectedYield: '100-130 tons/ha',
                season: 'Year-round',
                waterRequirement: 'High',
                reasons: ['High fertility supports long duration', 'Good water availability', 'Deep soil']
            },
            {
                crop: 'Banana',
                suitability: 'Very Good',
                expectedYield: '50-60 tons/ha',
                season: 'Year-round',
                waterRequirement: 'High',
                reasons: ['Rich nutrient requirement met', 'Good moisture', 'High commercial value']
            },
            {
                crop: 'Cotton (Hybrid)',
                suitability: 'Good',
                expectedYield: '2.5-3 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Medium',
                reasons: ['Good for Bt cotton', 'High yielding under irrigation']
            }
        ],
        avoidCrops: ['Drought-tolerant crops (wastage of fertile land)', 'Millets'],
        improvements: [
            'Balanced NPK fertilization',
            'Prevent waterlogging',
            'Crop rotation to prevent depletion',
            'Maintain organic matter'
        ]
    },

    {
        soilTypeName: 'Coastal Alluvium',
        scientificName: 'Coastal Alluvial Soil',
        pHRange: { min: 7.0, max: 8.3, optimal: 7.6 },
        texture: '15-25% clay, 50-65% sand, 20-30% silt',
        characteristics: [
            'Sandy texture',
            'Saline in coastal areas',
            'Alkaline pH',
            'Fast draining',
            'Moderate fertility'
        ],
        drainage: 'Good',
        nutrients: {
            nitrogen: 'Low',
            phosphorus: 'Low',
            potassium: 'Medium',
            organicMatter: 'Low'
        },
        districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Ramanathapuram'],
        bestCrops: [
            {
                crop: 'Coconut',
                suitability: 'Excellent',
                expectedYield: '80-120 nuts/tree/year',
                season: 'Perennial',
                waterRequirement: 'Medium',
                reasons: ['Salt tolerant', 'Sandy soil with groundwater', 'Traditional coastal crop', 'Deep roots']
            },
            {
                crop: 'Cashew',
                suitability: 'Excellent',
                expectedYield: '10-15 kg/tree',
                season: 'Perennial',
                waterRequirement: 'Low',
                reasons: ['Thrives in sandy coastal soil', 'Drought tolerant', 'Salt tolerant', 'High value']
            },
            {
                crop: 'Casuarina',
                suitability: 'Excellent',
                expectedYield: '150-200 tons/ha (10 years)',
                season: 'Perennial',
                waterRequirement: 'Low',
                reasons: ['Coastal shelter belt', 'Saline soil tolerant', 'Industrial wood', 'Quick growing']
            },
            {
                crop: 'Groundnut',
                suitability: 'Very Good',
                expectedYield: '1.5-2 tons/ha',
                season: 'Kharif',
                waterRequirement: 'Medium',
                reasons: ['Sandy soil for pod development', 'Short duration', 'Nitrogen fixing']
            },
            {
                crop: 'Pulses (Green gram, Black gram)',
                suitability: 'Good',
                expectedYield: '0.8-1.2 tons/ha',
                season: 'Rabi & Summer',
                waterRequirement: 'Low',
                reasons: ['Short duration', 'Tolerates sandiness', 'Improves soil']
            }
        ],
        avoidCrops: ['Tea', 'Coffee', 'Crops sensitive to salinity', 'Heavy clay-loving crops'],
        improvements: [
            'Drip irrigation to prevent salt accumulation',
            'Green manuring',
            'Mulching to retain moisture',
            'Prevent seawater intrusion'
        ]
    },

    // =================== LATERITE SOILS ===================
    {
        soilTypeName: 'Laterite Soil',
        scientificName: 'Oxisols (Lateritic)',
        pHRange: { min: 4.5, max: 6.5, optimal: 5.5 },
        texture: '15-30% clay, 35-55% sand, 20-35% silt',
        characteristics: [
            'Highly acidic',
            'Rich in iron and aluminum',
            'Low fertility',
            'Red-purple color',
            'Forms hard crust when exposed',
            'High rainfall areas'
        ],
        drainage: 'Excellent',
        nutrients: {
            nitrogen: 'Low',
            phosphorus: 'Low',
            potassium: 'Low',
            organicMatter: 'High' // In forested areas
        },
        districts: ['Nilgiris', 'Parts of Dindigul (Kodaikanal)', 'Western Ghats foothill'],
        bestCrops: [
            {
                crop: 'Tea',
                suitability: 'Excellent',
                expectedYield: '2000-3000 kg/ha',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Loves acidic soil', 'High rainfall suits', 'Cool climate', 'Well-drained essential']
            },
            {
                crop: 'Coffee (Arabica & Robusta)',
                suitability: 'Excellent',
                expectedYield: '800-1500 kg/ha',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Acidic pH ideal', 'Shade-grown', 'High organic matter', 'Cool climate']
            },
            {
                crop: 'Cardamom',
                suitability: 'Excellent',
                expectedYield: '200-400 kg/ha',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Shade-loving', 'Acidic soil requirement', 'High value spice', 'Cool humid climate']
            },
            {
                crop: 'Pepper (Black Pepper)',
                suitability: 'Very Good',
                expectedYield: '1-2 kg/vine',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Climbing vine', 'Acidic tolerant', 'High value', 'Shade crop']
            },
            {
                crop: 'Pineapple',
                suitability: 'Good',
                expectedYield: '30-50 tons/ha',
                season: 'Year-round',
                waterRequirement: 'Medium',
                reasons: ['Acidic soil tolerant', 'Well-drained requirement', 'Commercial fruit']
            },
            {
                crop: 'Tapioca',
                suitability: 'Good',
                expectedYield: '20-30 tons/ha',
                season: 'Year-round',
                waterRequirement: 'Medium',
                reasons: ['Tolerates low fertility', 'Acidic soil', 'Food security crop']
            }
        ],
        avoidCrops: ['Wheat', 'Chickpea', 'All alkaline-loving crops', 'Heavy feeders without amendments'],
        improvements: [
            'Lime application to raise pH',
            'Heavy composting essential',
            'Rock phosphate for P deficiency',
            'Prevent erosion on slopes'
        ]
    },

    // =================== FOREST/HILL SOILS ===================
    {
        soilTypeName: 'Forest Loam (Hill Soil)',
        scientificName: 'Mountain Soil',
        pHRange: { min: 5.0, max: 6.5, optimal: 5.8 },
        texture: '20-30% clay, 35-50% sand, 25-40% silt',
        characteristics: [
            'High organic matter',
            'Dark color',
            'Acidic',
            'Well-structured',
            'Good drainage',
            'Cool climate'
        ],
        drainage: 'Excellent',
        nutrients: {
            nitrogen: 'High',
            phosphorus: 'Medium',
            potassium: 'Medium',
            organicMatter: 'High'
        },
        districts: ['Nilgiris', 'Kodaikanal (Dindigul)', 'Yercaud (Salem)'],
        bestCrops: [
            {
                crop: 'Potato',
                suitability: 'Excellent',
                expectedYield: '25-35 tons/ha',
                season: 'Rabi (Oct-Jan planting)',
                waterRequirement: 'Medium',
                reasons: ['Cool climate requirement', 'Friable soil for tubers', 'High organic matter', 'pH 5.5-6.5 ideal']
            },
            {
                crop: 'Vegetables (Carrot, Cabbage, Cauliflower, Beans)',
                suitability: 'Excellent',
                expectedYield: '30-50 tons/ha',
                season: 'Year-round (cool season)',
                waterRequirement: 'Medium',
                reasons: ['Cool climate vegetables', 'High quality produce', 'Premium market prices', 'Organic farming suitable']
            },
            {
                crop: 'Tea',
                suitability: 'Excellent',
                expectedYield: '2500-3500 kg/ha',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Cool climate ideal', 'Acidic soil', 'High rainfall', 'Excellent quality']
            },
            {
                crop: 'Coffee',
                suitability: 'Very Good',
                expectedYield: '1000-1500 kg/ha',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Cool hills perfect', 'Shade-grown', 'High value']
            },
            {
                crop: 'Fruit Trees (Apple, Peach, Plum)',
                suitability: 'Good',
                expectedYield: '10-20 tons/ha',
                season: 'Perennial',
                waterRequirement: 'Medium',
                reasons: ['Temperate fruits', 'Chilling requirement', 'High value niche market']
            }
        ],
        avoidCrops: ['Tropical crops', 'Cotton', 'Sugarcane', 'Heat-loving crops'],
        improvements: [
            'Maintain organic matter through leaf litter',
            'Terracing to prevent erosion',
            'pH monitoring',
            'Prevent over-exploitation'
        ]
    },

    // =================== SALINE/ALKALINE SOILS ===================
    {
        soilTypeName: 'Saline-Alkaline Soil',
        scientificName: 'Sodic Soil',
        pHRange: { min: 8.0, max: 10.0, optimal: 8.5 },
        texture: 'Variable, often clayey',
        characteristics: [
            'High salt content',
            'Very alkaline',
            'Poor structure',
            'White salt crust',
            'Low productivity',
            'Needs reclamation'
        ],
        drainage: 'Poor',
        nutrients: {
            nitrogen: 'Low',
            phosphorus: 'Low',
            potassium: 'Variable',
            organicMatter: 'Low'
        },
        districts: ['Ramanathapuram', 'Coastal areas', 'Parts of Madurai'],
        bestCrops: [
            {
                crop: 'Coconut (if reclaimed)',
                suitability: 'Good',
                expectedYield: '60-80 nuts/tree',
                season: 'Perennial',
                waterRequirement: 'High',
                reasons: ['Salt tolerant', 'Deep roots access fresh water', 'After gypsum treatment']
            },
            {
                crop: 'Date Palm',
                suitability: 'Good',
                expectedYield: '50-100 kg/tree',
                season: 'Perennial',
                waterRequirement: 'Medium',
                reasons: ['Highly salt tolerant', 'Alkaline soil', 'Drought hardy']
            },
            {
                crop: 'Barley',
                suitability: 'Moderate',
                expectedYield: '2-3 tons/ha',
                season: 'Rabi',
                waterRequirement: 'Low',
                reasons: ['Salt tolerant cereal', 'Fodder use', 'Short duration']
            },
            {
                crop: 'Salt-tolerant Grasses (Fodder)',
                suitability: 'Good',
                expectedYield: '15-25 tons/ha',
                season: 'Year-round',
                waterRequirement: 'Low',
                reasons: ['Grazing', 'Soil rehabilitation', 'Bio-drainage']
            }
        ],
        avoidCrops: ['Most regular crops without reclamation', 'Sensitive vegetables', 'Pulses'],
        improvements: [
            'Gypsum application (CaSO4) - essential',
            'Leaching with good quality water',
            'Deep plowing',
            'Organic manure addition',
            'Bio-drainage with eucalyptus',
            'Sub-surface drainage'
        ]
    }
];

// Helper function to get crop recommendations by soil type
export function getCropsBySoilType(soilTypeName: string) {
    const soilType = tamilNaduSoilTypes.find(s =>
        s.soilTypeName.toLowerCase().includes(soilTypeName.toLowerCase())
    );
    return soilType || null;
}

// Helper to match soil properties to best soil type
export function identifySoilType(ph: number, clayPercent: number, sandPercent: number): SoilTypeCropRecommendation | null {
    // Match based on pH and texture
    for (const soilType of tamilNaduSoilTypes) {
        if (ph >= soilType.pHRange.min && ph <= soilType.pHRange.max) {
            // Simple texture matching logic
            if (clayPercent > 40 && soilType.soilTypeName.includes('Black')) return soilType;
            if (clayPercent < 25 && sandPercent > 50 && soilType.soilTypeName.includes('Sandy')) return soilType;
            if (ph < 6.5 && soilType.soilTypeName.includes('Laterite')) return soilType;
            if (ph >= 6.5 && ph <= 7.5 && clayPercent >= 25 && clayPercent <= 35 && soilType.soilTypeName.includes('Red Loamy')) return soilType;
            if (clayPercent >= 30 && clayPercent <= 40 && soilType.soilTypeName.includes('Alluvium')) return soilType;
        }
    }

    // Default fallback
    return tamilNaduSoilTypes[0]; // Red Loamy as default
}
