/**
 * Rule-Based Crop Recommendation Engine
 * Analyzes real soil data and form inputs to provide accurate recommendations
 * WITHOUT relying on AI - uses scientific soil database
 */

import { getTamilNaduSoilProfile } from '../data/tamil-nadu-soil-profiles';
import type { CropRecommendation } from '../data/tamil-nadu-soil-profiles';

interface RecommendationInput {
    latitude: number;
    longitude: number;
    soilType: string;
    rainfall: string;
    primaryGoal: string;
    riskTolerance: string;
    fieldSize: number;
    soilData?: any[]; // SoilGrids data
}

interface RecommendationOutput {
    crops: string[];
    reasoning: string;
    soilDataSummary: {
        ph: string;
        clay: string;
        sand: string;
        nitrogen: string;
        organicCarbon: string;
    };
    district: string;
    suitability: { [crop: string]: string };
}

export function getRuleBasedRecommendation(input: RecommendationInput): RecommendationOutput {
    // Get district profile
    const profile = getTamilNaduSoilProfile(input.latitude, input.longitude);

    // Extract soil data values
    let actualPH = profile.pH.typical;
    let actualClay = profile.clay.typical;
    let actualSand = profile.sand.typical;
    let actualNitrogen = profile.nitrogen.typical;
    let actualOC = profile.organicCarbon.typical;

    // Use actual SoilGrids data if available
    if (input.soilData && input.soilData.length > 0) {
        const phData = input.soilData.find((d: any) => d.name === 'phh2o');
        const clayData = input.soilData.find((d: any) => d.name === 'clay');
        const sandData = input.soilData.find((d: any) => d.name === 'sand');
        const nitrogenData = input.soilData.find((d: any) => d.name === 'nitrogen');
        const socData = input.soilData.find((d: any) => d.name === 'soc');

        if (phData) actualPH = phData.depths[0].values.mean / 10;
        if (clayData) actualClay = clayData.depths[0].values.mean / 10;
        if (sandData) actualSand = sandData.depths[0].values.mean / 10;
        if (nitrogenData) actualNitrogen = nitrogenData.depths[0].values.mean;
        if (socData) actualOC = socData.depths[0].values.mean / 10;
    }

    // Score and filter crops based on soil properties
    let scoredCrops = profile.recommendedCrops.map(crop => {
        let score = 100;
        let reasons: string[] = [];

        // pH suitability
        if (actualPH < 6.0) {
            if (['Tea', 'Coffee', 'Ginger', 'Turmeric', 'Finger Millet'].includes(crop.crop)) {
                score += 20;
                reasons.push('acidic soil lover');
            } else if (['Wheat', 'Sugarcane', 'Sorghum', 'Mustard'].includes(crop.crop)) {
                score -= 30;
            }
        } else if (actualPH > 7.5) {
            if (['Coconut', 'Sugarcane', 'Cotton', 'Sorghum'].includes(crop.crop)) {
                score += 15;
                reasons.push('alkaline tolerant');
            } else if (['Tea', 'Coffee', 'Finger Millet'].includes(crop.crop)) {
                score -= 25;
            }
        }

        // Clay content suitability
        if (actualClay > 40) { // Heavy clay
            if (['Cotton', 'Sugarcane', 'Rice', 'Turmeric'].includes(crop.crop)) {
                score += 25;
                reasons.push('thrives in clayey soil');
            }
        } else if (actualClay < 20) { // Sandy
            if (['Coconut', 'Cashew', 'Groundnut', 'Pearl Millet'].includes(crop.crop)) {
                score += 20;
                reasons.push('suited for sandy soil');
            } else if (['Cotton', 'Sugarcane'].includes(crop.crop)) {
                score -= 20;
            }
        }

        // Primary goal alignment
        if (input.primaryGoal === 'profit') {
            if (crop.marketDemand === 'high') {
                score += 30;
                reasons.push('high market demand');
            }
        } else if (input.primaryGoal === 'soil-health') {
            if (['Red gram', 'Green gram', 'Black gram', 'Chickpea'].includes(crop.crop)) {
                score += 40;
                reasons.push('nitrogen-fixing legume');
            }
        }

        // Risk tolerance
        if (input.riskTolerance === 'low') {
            if (['Rice', 'Groundnut', 'Maize', 'Finger Millet'].includes(crop.crop)) {
                score += 15;
                reasons.push('stable crop');
            }
        } else if (input.riskTolerance === 'high') {
            if (['Cotton', 'Turmeric', 'Banana', 'Vegetables'].includes(crop.crop)) {
                score += 20;
                reasons.push('high-value cash crop');
            }
        }

        // Suitability from database
        if (crop.suitability === 'excellent') score += 40;
        else if (crop.suitability === 'good') score += 20;
        else score += 5;

        return {
            ...crop,
            score,
            reasons: reasons.join(', ')
        };
    });

    // Sort by score and take top crops
    scoredCrops.sort((a, b) => b.score - a.score);
    const topCrops = scoredCrops.slice(0, 5);

    // Build reasoning
    let reasoning = `Based on detailed analysis of ${profile.district} district:\n\n`;
    reasoning += `**Soil Characteristics:**\n`;
    reasoning += `- pH ${actualPH.toFixed(1)} (${actualPH < 6.5 ? 'acidic' : actualPH > 7.5 ? 'alkaline' : 'neutral'})\n`;
    reasoning += `- ${actualClay.toFixed(0)}% clay, ${actualSand.toFixed(0)}% sand (${actualClay > 35 ? 'heavy' : actualClay < 20 ? 'light, sandy' : 'medium loam'} texture)\n`;
    reasoning += `- Nitrogen: ${actualNitrogen.toFixed(0)} cg/kg, Organic Carbon: ${actualOC.toFixed(1)} g/kg\n`;
    reasoning += `- Soil type: ${profile.soilType}\n`;
    reasoning += `- Average rainfall: ${profile.averageRainfall}mm\n\n`;

    reasoning += `**Recommended Crops (in order of suitability):**\n\n`;
    topCrops.forEach((crop, idx) => {
        reasoning += `${idx + 1}. **${crop.crop}** (${crop.suitability})\n`;
        reasoning += `   - Season: ${crop.season}\n`;
        reasoning += `   - Expected yield: ${crop.expectedYield}\n`;
        reasoning += `   - Market demand: ${crop.marketDemand}\n`;
        reasoning += `   - Water requirement: ${crop.waterRequirement}\n`;
        if (crop.reasons) reasoning += `   - Why: ${crop.reasons}\n`;
        reasoning += `\n`;
    });

    reasoning += `This recommendation is based on:\n`;
    reasoning += `- Scientific soil data for ${profile.district} district\n`;
    reasoning += `- Your goal: ${input.primaryGoal}\n`;
    reasoning += `- Your risk tolerance: ${input.riskTolerance}\n`;
    reasoning += `- Tamil Nadu Agricultural University (TNAU) crop suitability research\n`;

    // Build suitability map
    const suitability: { [crop: string]: string } = {};
    topCrops.forEach(crop => {
        suitability[crop.crop] = crop.suitability;
    });

    return {
        crops: topCrops.map(c => c.crop),
        reasoning,
        soilDataSummary: {
            ph: actualPH.toFixed(1),
            clay: `${actualClay.toFixed(0)}%`,
            sand: `${actualSand.toFixed(0)}%`,
            nitrogen: `${actualNitrogen.toFixed(0)} cg/kg`,
            organicCarbon: `${actualOC.toFixed(1)} g/kg`
        },
        district: profile.district,
        suitability
    };
}
