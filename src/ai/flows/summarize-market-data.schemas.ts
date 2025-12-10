
/**
 * @fileOverview Schemas for the market data summarization flow.
 */

import {z} from 'zod';

export const SummarizeMarketDataInputSchema = z.object({
    marketData: z
      .string()
      .describe(
        'A string containing the market data, including prices, trends, and forecasts.'
      ),
    farmerExpenditures: z
      .string()
      .describe(
        'A string containing the farmer expenditures on the crop.'
      ),
  });
  export type SummarizeMarketDataInput = z.infer<typeof SummarizeMarketDataInputSchema>;
  
  export const SummarizeMarketDataOutputSchema = z.object({
    summary: z.string().describe('A summarized report of market data, trends, and forecasts.'),
    profitLossAnalysis: z.string().describe('An analysis of profit and loss based on market data and farmer expenditures.')
  });
  export type SummarizeMarketDataOutput = z.infer<typeof SummarizeMarketDataOutputSchema>;
