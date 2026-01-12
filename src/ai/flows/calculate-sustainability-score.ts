
'use server';

/**
 * @fileOverview Calculates a sustainability score for farming practices based on detailed farm data.
 *
 * - calculateSustainabilityScore - A function that calculates the sustainability score.
 */

import { ai } from '@/ai/genkit';
import { CalculateSustainabilityScoreInput, CalculateSustainabilityScoreOutput, CalculateSustainabilityScoreInputSchema, CalculateSustainabilityScoreOutputSchema } from './calculate-sustainability-score.schemas';

export async function calculateSustainabilityScore(
  input: CalculateSustainabilityScoreInput
): Promise<CalculateSustainabilityScoreOutput> {

  // Parse input data to make decision logic
  const crop = input.preferredCrop?.toLowerCase() || "";
  // Simplified parsing of mock JSON strings for logic
  const practices = JSON.parse(input.farmingPractices || "{}");
  const soil = JSON.parse(input.soilHealthData || "{}");

  let baseScore = 75;
  let rationaleParts = [];

  // 1. Crop-Specific Adjustments
  if (crop.includes('rice') || crop.includes('paddy') || crop.includes('sugarcane')) {
    // Water intensive crops
    if (practices.irrigation === 'flood') {
      baseScore -= 10;
      rationaleParts.push(`Growing water-intensive **${input.preferredCrop}** with **flood irrigation** significantly reduces sustainability due to high water consumption and methane emissions.`);
    } else if (practices.irrigation === 'drip' || practices.irrigation === 'sprinkler') {
      baseScore += 5;
      rationaleParts.push(`Using **${practices.irrigation} irrigation** for **${input.preferredCrop}** is an excellent choice, mitigating the high water demand of the crop.`);
    }
  } else if (crop.includes('millet') || crop.includes('ragi') || crop.includes('sorghum')) {
    // Drought resistant crops
    baseScore += 10;
    rationaleParts.push(`Choosing **${input.preferredCrop}** is highly sustainable for this region as it requires less water and inputs compared to cash crops.`);
  }

  // 2. Soil Health Adjustments
  // 2. Soil Health Adjustments
  // Nitrogen Check
  if (soil.nitrogen === 'high' || soil.nitrogen === 'excessive') {
    baseScore -= 5;
    rationaleParts.push("Soil analysis indicates **excessive nutrient levels** (High Nitrogen), suggesting over-fertilization which risks runoff and pollution.");
  } else if (soil.nitrogen === 'low') {
    baseScore -= 5;
    rationaleParts.push("Soil nitrogen is **low**, which may limit crop growth unless managed with organic amendments.");
  }

  // pH Check
  if (soil.ph === 'acidic' || soil.ph === 'alkaline') {
    baseScore -= 3;
    rationaleParts.push(`Soil pH is **${soil.ph}**, which might lock up nutrients. Consider amendments like lime or gypsum.`);
  }

  // Pesticides
  if (practices.pesticides === 'organic') {
    baseScore += 8;
    rationaleParts.push("Your use of **organic pesticides/practices** greatly benefits long-term soil health and biodiversity.");
  }

  // Crop Rotation (Text Input became Category)
  // We treat cropRotationData as a simple string category now
  if (input.cropRotationData === 'monoculture') {
    baseScore -= 10;
    rationaleParts.push("**Monoculture** (growing the same crop repeatedly) depletes soil nutrients and increases disease risk. Strongly consider rotation.");
  } else if (input.cropRotationData.includes('legume')) {
    baseScore += 10;
    rationaleParts.push("Including **legumes in rotation** is excellent for natural nitrogen fixation and soil health.");
  }

  // 3. Tillage
  if (practices.tillage === 'no-till' || practices.tillage === 'minimum-till') {
    baseScore += 7;
    rationaleParts.push("Adopting **conservation tillage** helps retain soil moisture and organic carbon, boosting your score.");
  }

  // Cap score
  const finalScore = Math.min(100, Math.max(0, baseScore));

  const defaultRationale = "Your score reflects a strong foundation in sustainable practices. \n\nTo further improve:\n- Enhance water efficiency.\n- Adopt Integrated Pest Management (IPM).";

  const finalRationale = rationaleParts.length > 0
    ? `**Sustainability Analysis for ${input.preferredCrop || 'Your Farm'}:**\n\n` + rationaleParts.join("\n\n") + "\n\n**General Recommendations:**\nConsider crop rotation with legumes to fix nitrogen naturally."
    : defaultRationale;

  const output: CalculateSustainabilityScoreOutput = {
    sustainabilityScore: finalScore,
    rationale: finalRationale
  };

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return output;
}

const calculateSustainabilityScoreFlow = ai.defineFlow(
  {
    name: 'calculateSustainabilityScoreFlow',
    inputSchema: CalculateSustainabilityScoreInputSchema,
    outputSchema: CalculateSustainabilityScoreOutputSchema,
  },
  calculateSustainabilityScore
);
