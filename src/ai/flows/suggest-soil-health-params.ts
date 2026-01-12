import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

/**
 * AI Flow: Suggest Soil Health Parameters
 * 
 * Intelligently suggests optimal soil health values based on:
 * - Crop type
 * - Location/region
 * - Soil type
 * - Previous farming practices
 */

const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});

export const suggestSoilHealthParams = ai.defineFlow(
    {
        name: 'suggestSoilHealthParams',
        inputSchema: z.object({
            cropType: z.string().optional().describe('Type of crop being grown'),
            location: z.string().optional().describe('Geographic location of farm'),
            soilType: z.string().optional().describe('Type of soil (red, black, alluvial, etc.)'),
            farmingPractices: z.string().optional().describe('Current or planned farming practices'),
        }),
        outputSchema: z.object({
            nitrogenLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']).describe('Recommended nitrogen level'),
            phosphorusLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']).describe('Recommended phosphorus level'),
            potassiumLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']).describe('Recommended potassium level'),
            soilPH: z.enum(['Acidic (<6)', 'Neutral (6.0-7.5)', 'Alkaline (>7.5)']).describe('Recommended soil pH range'),
            moistureLevel: z.enum(['Low', 'Optimal', 'High']).describe('Recommended moisture level'),
            explanation: z.string().describe('Brief explanation of recommendations'),
        }),
    },
    async (input) => {
        const { output } = await ai.generate({
            model: gemini15Flash,
            prompt: `You are an agricultural expert AI assistant. Based on the provided farm information, suggest optimal soil health parameters for sustainable farming.

Farm Information:
- Crop Type: ${input.cropType || 'Not specified'}
- Location: ${input.location || 'Not specified'}
- Soil Type: ${input.soilType || 'Not specified'}
- Farming Practices: ${input.farmingPractices || 'Not specified'}

Provide recommendations for:
1. Nitrogen Level (Low/Medium/Optimal/High)
2. Phosphorus Level (Low/Medium/Optimal/High)
3. Potassium Level (Low/Medium/Optimal/High)
4. Soil pH (Acidic (<6)/Neutral (6.0-7.5)/Alkaline (>7.5))
5. Moisture Level (Low/Optimal/High)

Guidelines:
- For most crops in India, nitrogen, phosphorus, and potassium should be "Optimal"
- Soil pH should generally be "Neutral (6.0-7.5)" for most crops
- Moisture should typically be "Optimal" for sustainable farming
- Adjust based on specific crop requirements and soil type
- Consider organic farming practices

Respond in JSON format with: nitrogenLevel, phosphorusLevel, potassiumLevel, soilPH, moistureLevel, and explanation.

Example response:
{
  "nitrogenLevel": "Optimal",
  "phosphorusLevel": "Optimal",
  "potassiumLevel": "Optimal",
  "soilPH": "Neutral (6.0-7.5)",
  "moistureLevel": "Optimal",
  "explanation": "For rice cultivation in Tamil Nadu with alluvial soil, these balanced NPK levels with neutral pH and optimal moisture create ideal conditions for sustainable high yields."
}`,
            config: {
                temperature: 0.3, // Lower temperature for more consistent recommendations
            },
            output: {
                format: 'json',
                schema: z.object({
                    nitrogenLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']),
                    phosphorusLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']),
                    potassiumLevel: z.enum(['Low', 'Medium', 'Optimal', 'High']),
                    soilPH: z.enum(['Acidic (<6)', 'Neutral (6.0-7.5)', 'Alkaline (>7.5)']),
                    moistureLevel: z.enum(['Low', 'Optimal', 'High']),
                    explanation: z.string(),
                }),
            },
        });

        return output;
    }
);
