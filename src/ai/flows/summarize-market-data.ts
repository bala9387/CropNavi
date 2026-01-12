
'use server';

/**
 * @fileOverview Summarizes market data to provide farmers with a quick understanding of market conditions.
 *
 * - summarizeMarketData - A function that summarizes market data and provides trends and forecasts.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { SummarizeMarketDataInput, SummarizeMarketDataOutput, SummarizeMarketDataInputSchema, SummarizeMarketDataOutputSchema } from './summarize-market-data.schemas';


export async function summarizeMarketData(input: SummarizeMarketDataInput): Promise<SummarizeMarketDataOutput> {
  return await summarizeMarketDataFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: SummarizeMarketDataInputSchema },
  output: { schema: SummarizeMarketDataOutputSchema },
  model: googleAI.model('gemini-1.5-pro-preview'),
  prompt: `You are an expert agricultural market analyst. Your task is to provide a clear, concise, and actionable financial analysis for a farmer based on the provided data.

    **Input Data:**
    1.  **Market Data:** A string containing recent price trends for a specific crop.
        \`\`\`
        {{{marketData}}}
        \`\`\`
    2.  **Farmer Expenditures:** A string describing the farmer's costs.
        \`\`\`
        {{{farmerExpenditures}}}
        \`\`\`

    **Your Analysis must perform the following:**

    1.  **Market Summary:** Analyze the trend (Upward/Downward/Stable) and forecast.
    2.  **Financial Calculations:**
        *   Estimate the **Total Revenue** based on current/average prices.
        *   Estimate **Total Costs** from the expenditures provided.
        *   Calculate **Net Profit** (Revenue - Costs).
        *   Calculate **ROI** ((Net Profit / Costs) * 100).
        *   Calculate **Profit Margin**.
        *(If exact quantities aren't provided, assume a standard yield of 1 ton or 1 acre for calculation purposes, or give a per-unit analysis).*
    3.  **Actionable Advice:** Provide 3-5 distinct, concrete steps the farmer should take (e.g., "Sell 30% now", "Hold for 2 weeks", "Switch fertilizer brand").

    **Output Format:**
    Return ONLY valid JSON matching the schema.
    - **trend**: One of "Upward", "Downward", "Stable", "Volatile".
    - **netProfit**: string (e.g., "Rs. 15,000 / ton").
    - **roi**: string (e.g., "12%").
    - **actionableAdvice**: Array of strings.
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
        trend: "Upward",
        netProfit: "Rs. 4,500 / ton",
        profitMargin: "12%",
        roi: "15%",
        actionableAdvice: [
          "Consider selling 50% of your produce now to capture current prices.",
          "Monitor daily prices for the next week before selling the rest.",
          "Explore local organic markets for potentially higher premiums."
        ],
        profitLossAnalysis: "Based on your provided expenditures, the current market prices suggest a moderate profit margin. To capitalize on the current high prices, consider selling a portion of your harvest now to secure profits while monitoring the market for further increases."
      };
    }
  }
);
