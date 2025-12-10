
/**
 * @fileOverview Schemas for the crop recommendation flow.
 */

import {z} from 'zod';

export const AICropRecommendationFromPromptInputSchema = z.object({
    prompt: z
      .string()
      .describe(
        'A detailed prompt describing the farmer’s location, soil conditions, preferences, and any other relevant information for crop recommendation.'
      ),
  });
  export type AICropRecommendationFromPromptInput =
    z.infer<typeof AICropRecommendationFromPromptInputSchema>;
  
  export const AICropRecommendationFromPromptOutputSchema = z.object({
    crops: z
      .string()
      .describe(
        'A comma-separated list of recommended crops based on the provided prompt and soil data, prioritizing suitability, sustainability, and profitability.'
      ),
    reasoning: z
      .string()
      .describe(
        'A detailed explanation of why these crops are recommended, referencing specific soil data (pH, OC, N, P, K), weather data, and user preferences.'
      ),
    soilDataSummary: z.object({
          ph: z.string().describe('The pH value of the soil.'),
          n: z.string().describe('The Nitrogen (N) content of the soil.'),
          p: z.string().describe('The Phosphorus (P) content of the soil.'),
          k: z.string().describe('The Potassium (K) content of the soil.'),
          oc: z.string().describe('The Organic Carbon (OC) content of the soil.'),
          currentTemp: z.string().optional().describe('The current temperature in Celsius.'),
          humidity: z.string().optional().describe('The current relative humidity.'),
          forecast: z.string().optional().describe('A brief weather forecast for the next few days.'),
      }).optional().describe('A summary of the key soil and weather data points used for the recommendation.')
  });
  export type AICropRecommendationFromPromptOutput =
    z.infer<typeof AICropRecommendationFromPromptOutputSchema>;
