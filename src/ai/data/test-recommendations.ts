/**
 * TEST: Verify different locations give different crop recommendations
 */

import { getTamilNaduSoilProfile } from './tamil-nadu-soil-profiles';
import { getRuleBasedRecommendation } from '../utils/rule-based-recommendations';

// Test locations
const testLocations = [
    { name: 'Salem (Interior Red Loam)', lat: 11.627, lon: 78.149 },
    { name: 'Chennai (Coastal Sandy)', lat: 13.0827, lon: 80.2707 },
    { name: 'Coimbatore (Black Cotton)', lat: 11.0168, lon: 76.9558 },
    { name: 'Thanjavur (Delta Rice Bowl)', lat: 10.79, lon: 79.14 },
    { name: 'Nilgiris (Hill Tea/Coffee)', lat: 11.41, lon: 76.70 },
];

console.log('='.repeat(80));
console.log('TESTING CROP RECOMMENDATIONS FOR DIFFERENT LOCATIONS');
console.log('='.repeat(80));

testLocations.forEach(location => {
    console.log(`\n📍 **${location.name}** (${location.lat}, ${location.lon})`);
    console.log('-'.repeat(80));

    // Get profile
    const profile = getTamilNaduSoilProfile(location.lat, location.lon);
    console.log(`District: ${profile.district}`);
    console.log(`Soil Type: ${profile.soilType}`);
    console.log(`pH: ${profile.pH.typical}, Clay: ${profile.clay.typical}%, Sand: ${profile.sand.typical}%`);
    console.log(`Rainfall: ${profile.averageRainfall}mm`);

    // Get recommendations
    const recommendation = getRuleBasedRecommendation({
        latitude: location.lat,
        longitude: location.lon,
        soilType: 'loam', // generic input
        rainfall: '500-1000mm',
        primaryGoal: 'profit',
        riskTolerance: 'medium',
        fieldSize: 5,
        soilData: undefined // no API data, use profile
    });

    console.log(`\n✅ TOP 5 RECOMMENDED CROPS:`);
    recommendation.crops.forEach((crop, idx) => {
        console.log(`   ${idx + 1}. ${crop} (${recommendation.suitability[crop] || 'N/A'})`);
    });

    console.log(`\nSoil Summary:`);
    console.log(`   pH: ${recommendation.soilDataSummary.ph}`);
    console.log(`   Clay: ${recommendation.soilDataSummary.clay}`);
    console.log(`   Sand: ${recommendation.soilDataSummary.sand}`);
});

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE - Check if recommendations differ by location');
console.log('='.repeat(80));
