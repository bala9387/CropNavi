'use server';

/**
 * @fileOverview AI agent for Tamil Nadu-specific crop recommendations
 * Enhanced with detailed soil interpretation and regional crop knowledge
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getWeatherData } from '@/ai/tools/get-weather-data';
import { z } from 'zod';
import {
  AICropRecommendationFromPromptInputSchema,
  AICropRecommendationFromPromptOutputSchema,
  AICropRecommendationFromPromptInput,
} from './ai-crop-recommendation-from-prompt.schemas';

const recommendationPrompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: { schema: AICropRecommendationFromPromptInputSchema },
  output: { schema: AICropRecommendationFromPromptOutputSchema },
  model: googleAI.model('gemini-1.5-pro-preview'),
  config: { temperature: 0.9, topK: 40, topP: 0.95 },
  tools: [getWeatherData],
  prompt: `You are an expert agronomist AI specializing in Tamil Nadu agricultural conditions, with deep knowledge of Indian farming practices. Your goal is to provide scientifically accurate, region-specific, and profitable crop recommendations.

**CRITICAL: You MUST analyze the detailed soil data provided in the user's prompt. Use specific values like pH 6.8, clay 28%, etc., not generic descriptions.**

Analyze the user's prompt containing farm details, location, soil properties, budget, and goals.

If latitude/longitude are provided, USE the 'getWeatherData' tool to fetch current and forecasted weather. Integrate this into your reasoning.

**Tamil Nadu Crop Suitability Knowledge:**

**Soil pH Interpretation**:
- pH < 6.0 (Acidic): Ideal for Tea, Coffee, Ginger, Turmeric, Finger Millet. Avoid alkaline-loving crops.
- pH 6.0-7.0 (Slightly acidic): Excellent for Groundnut, Cotton, Maize, Pulses, Vegetables.
- pH 7.0-8.0 (Neutral-Alkaline): Suitable for Wheat, Sugarcane, Sorghum, Mustard, Sunflower.
- pH > 8.0 (Highly alkaline): Limited options - Coconut, Date Palm, some salt-tolerant crops.

**Soil Texture & Clay Content**:
- High Clay (35-50%): Black cotton soil → Cotton, Sugarcane, Turmeric, Chickpea. Excellent water retention, heavy texture.
- Medium Clay (25-35%): Red loam → Groundnut, Maize, Pulses, Finger Millet, Tapioca. Balanced drainage.
- Low Clay (<25%): Sandy/Coastal → Coconut, Cashew, Casuarina, Groundnut, Pearl Millet. Fast drainage, low nutrients.

**Regional Tamil Nadu Crops**:
- Coastal regions (Chennai, Cuddalore): Coconut, Cashew, Casuarina, Groundnut, Pulses
- Interior (Salem, Dharmapuri, Madurai): Cotton, Groundnut, Maize, Finger Millet, Pulses, Tapioca
- Western (Coimbatore, Erode): Cotton, Sugarcane, Turmeric, Banana, Maize, Vegetables 
- Hills (Nilgiris): Tea, Coffee, Potato, Vegetables, Spices

**Rainfall Requirements**:
- <500mm: Pearl Millet, Finger Millet, Horse Gram, Drought-tolerant crops
- 500-1000mm: Groundnut, Cotton, Maize, Pulses, Sorghum
- >1000mm: Sugarcane, Rice, Banana, Coconut, Tapioca

Provide:
1. **3-5 specific crops** based on EXACT soil data (pH, texture, nitrogen). **DO NOT recommend generic crops.** Match crops precisely to soil pH and clay content.
2. **Detailed reasoning** explaining:
   - Why each crop suits the SPECIFIC pH value
   - How clay % affects water retention for these crops
   - Nitrogen levels and fertilizer needs
   - Current weather impact
   - Economic viability in Tamil Nadu markets
3. **Soil data summary** used in your analysis

Prioritize high-value commercial crops suitable for Tamil Nadu conditions. If goal is "soil improvement," include legumes. If "profit," focus on cash crops with good market demand.

User's Prompt:
"{{prompt}}"
`,
});


export async function aiCropRecommendationFromPrompt(
  input: AICropRecommendationFromPromptInput
): Promise<z.infer<typeof AICropRecommendationFromPromptOutputSchema>> {

  try {
    const { output } = await recommendationPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }
    return output;
  } catch (error) {
    console.error("Error during AI crop recommendation:", error);
    // Fallback to a static response if the AI service is unavailable
    return {
      crops: 'Groundnut, Cotton, Finger Millet, Maize',
      reasoning: 'These crops are well-suited for Tamil Nadu\'s diverse soil types and moderate rainfall. They are profitable commercial crops with stable market demand in the region. This recommendation is based on general Tamil Nadu agricultural data.',
      soilDataSummary: {
        ph: '6.5-7.5',
        n: '100-130 kg/ha',
        p: '50-60 kg/ha',
        k: '40-50 kg/ha',
        oc: '0.8-1.2%',
      }
    };
  }
}

const aiCropRecommendationFromPromptFlow = ai.defineFlow(
  {
    name: 'aiCropRecommendationFromPromptFlow',
    inputSchema: AICropRecommendationFromPromptInputSchema,
    outputSchema: AICropRecommendationFromPromptOutputSchema,
  },
  aiCropRecommendationFromPrompt
);
