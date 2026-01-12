
/**
 * @fileOverview Schemas for the sustainability score calculation flow.
 */

import { z } from 'zod';

export const CalculateSustainabilityScoreInputSchema = z.object({
  soilHealthData: z
    .string()
    .describe(
      'JSON string with soil health metrics: { "nitrogen": number, "phosphorus": number, "potassium": number, "ph": number, "moisture": number }'
    ),
  cropRotationData: z
    .string()
    .describe(
      'A description of the farmer\'s crop rotation practices over the last few seasons, including types of crops and timing.'
    ),
  marketFinancialData: z
    .string()
    .describe(
      'A description of market trends from Agmarknet, crop prices, and farmer\'s expenses.'
    ),
  farmingPractices: z
    .string()
    .describe(
      'Description of the farming practices: e.g., { "irrigation": "drip", "tillage": "no-till", "pesticides": "organic" }.'
    ),
  climateData: z
    .string()
    .describe(
      'Historical climate data for the last 5 years, including annual rainfall and temperature trends.'
    ),
  marketHistory: z
    .string()
    .describe(
      'Historical market price data for the last 5 years, including average annual prices for key crops.'
    ),
  preferredCrop: z
    .string()
    .describe(
      'The specific crop the farmer intends to grow (e.g., "Rice", "Sugarcane"). The sustainability score will be tailored to this crop\'s requirements.'
    ),
});
export type CalculateSustainabilityScoreInput = z.infer<
  typeof CalculateSustainabilityScoreInputSchema
>;

export const CalculateSustainabilityScoreOutputSchema = z.object({
  sustainabilityScore: z
    .number()
    .describe(
      'A score from 0 to 100 representing the sustainability of the farming practices, with 100 being the most sustainable. The score should be a whole number.'
    ),
  rationale: z
    .string()
    .describe(
      'A detailed explanation of how the sustainability score was calculated, including the factors considered (soil health, crop rotation, water use, market viability) and their impact on the score. Provide specific, actionable recommendations for how the farmer can improve their score.'
    ),
});
export type CalculateSustainabilityScoreOutput = z.infer<
  typeof CalculateSustainabilityScoreOutputSchema
>;
