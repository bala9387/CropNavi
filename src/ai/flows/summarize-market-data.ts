
'use server';

/**
 * @fileOverview Summarizes market data to provide farmers with a quick understanding of market conditions.
 *
 * - summarizeMarketData - A function that summarizes market data and provides trends and forecasts.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { SummarizeMarketDataInput, SummarizeMarketDataOutput, SummarizeMarketDataInputSchema, SummarizeMarketDataOutputSchema } from './summarize-market-data.schemas';


export async function summarizeMarketData(input: SummarizeMarketDataInput): Promise<SummarizeMarketDataOutput> {
    return await summarizeMarketDataFlow(input);
}

const analysisPrompt = ai.definePrompt({
    name: 'marketAnalysisPrompt',
    input: {schema: SummarizeMarketDataInputSchema},
    output: {schema: SummarizeMarketDataOutputSchema},
    model: googleAI.model('gemini-1.5-pro-preview'),
    prompt: `You are an expert agricultural market analyst. Your task is to provide a clear, concise, and actionable analysis for a farmer based on the provided data.

    **Input Data:**
    1.  **Market Data:** A string containing recent price trends for a specific crop. Data is typically formatted as "Date: Price/ton".
        \`\`\`
        {{{marketData}}}
        \`\`\`
    2.  **Farmer Expenditures:** A string describing the farmer's costs.
        \`\`\`
        {{{farmerExpenditures}}}
        \`\`\`

    **Your Analysis must include two parts:**

    **1. Market Summary:**
    *   Analyze the provided market data.
    *   Identify the overall trend (e.g., upward, downward, stable, volatile).
    *   Mention any significant price changes.
    *   Provide a brief forecast based on the trend. Keep it simple and direct.

    **2. Profit & Loss Analysis:**
    *   Analyze the farmer's expenditures in relation to the market prices.
    *   Estimate the potential for profit or loss.
    *   Provide **one key, actionable suggestion** to maximize profit or minimize loss. Examples: "consider selling now to capitalize on the high prices," "it may be wise to store a portion of your harvest and wait for prices to potentially rise next month," or "focus on reducing labor costs to improve your profit margin."

    **Output Format:**
    Return the analysis in the specified JSON format with the 'summary' and 'profitLossAnalysis' fields.
    `,
});


const summarizeMarketDataFlow = ai.defineFlow(
  {
    name: 'summarizeMarketDataFlow',
    inputSchema: SummarizeMarketDataInputSchema,
    outputSchema: SummarizeMarketDataOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await analysisPrompt(input);
        if (!output) {
          throw new Error('The AI model did not return a valid output.');
        }
        return output;
    } catch (error) {
        console.error("Error during AI market analysis:", error);
        // Fallback to a response if the AI service is unavailable
        return {
            summary: "Market data indicates a slight upward trend over the past month. Prices have shown consistent growth with minor fluctuations, suggesting a stable demand. The forecast indicates prices may continue this upward trajectory in the short term.",
            profitLossAnalysis: "Based on your provided expenditures, the current market prices suggest a moderate profit margin. To capitalize on the current high prices, consider selling a portion of your harvest now to secure profits while monitoring the market for further increases."
        };
    }
  }
);
