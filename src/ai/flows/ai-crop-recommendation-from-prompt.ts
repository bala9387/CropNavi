'use server';

/**
 * @fileOverview An AI agent that recommends crops based on user input.
 *
 * - aiCropRecommendationFromPrompt - A function that takes a user prompt and returns crop recommendations.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getWeatherData} from '@/ai/tools/get-weather-data';
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
    tools: [getWeatherData],
    prompt: `You are an expert agronomist AI, specializing in crop recommendations for Indian farmers. Your goal is to provide sustainable, profitable, and practical advice.

Analyze the user's prompt, which contains details about their farm, location, soil, budget, and goals.

If the user provides latitude and longitude, you MUST use the 'getWeatherData' tool to fetch current and forecasted weather for that location. Integrate this live weather data into your reasoning.

Based on all available information (user prompt, soil data, and live weather), provide:
1.  A comma-separated list of 3-5 recommended crops.
2.  A detailed reasoning for your recommendations. Explain *why* these crops are suitable, referencing the user's soil type, rainfall, goals (e.g., cash crop, soil health), budget, and the current weather conditions (e.g., "Given the current high humidity and forecasted rain...").
3.  A summary of the key soil and weather data points you used.

Prioritize crops that are well-suited to the region and conditions. If the user has a specific goal like "soil improvement," include a nitrogen-fixing crop like a legume. If the goal is "profit," consider high-value cash crops suitable for the area.

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
          crops: 'Wheat, Maize, Mustard',
          reasoning: 'These crops are generally well-suited for loamy soil and moderate rainfall. They have stable market demand and are profitable in many regions of India. This recommendation is based on general data as live weather services were temporarily unavailable.',
          soilDataSummary: {
              ph: '6.5-7.5',
              n: '120-150 kg/ha',
              p: '50-60 kg/ha',
              k: '40-50 kg/ha',
              oc: '0.5-0.75%',
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
