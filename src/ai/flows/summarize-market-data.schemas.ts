
/**
 * @fileOverview Schemas for the market data summarization flow.
 */

import { z } from 'zod';

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
  trend: z.enum(['Upward', 'Downward', 'Stable', 'Volatile']).describe('The overall market trend direction.'),
  netProfit: z.string().describe('Estimated net profit calculation (e.g. "Rs. 25000/acre").'),
  profitMargin: z.string().describe('Estimated profit margin percentage (e.g. "25%").'),
  roi: z.string().describe('Return on Investment percentage.'),
  actionableAdvice: z.array(z.string()).describe('List of 3-5 specific, actionable steps for the farmer.'),
  profitLossAnalysis: z.string().describe('Detailed textual analysis of profit/loss context.')
});
export type SummarizeMarketDataOutput = z.infer<typeof SummarizeMarketDataOutputSchema>;
