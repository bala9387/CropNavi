'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { AIChatInput, AIChatOutput, AIChatInputSchema, AIChatOutputSchema } from './ai-chat.schemas';
import { translatePageContent } from './translate-page-content';
import { languages } from '@/lib/languages';
import { z } from 'zod';

const SimpleChatInputSchema = z.object({
  prompt: z.string(),
});

const SimpleChatOutputSchema = z.object({
  response: z.string(),
});

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: SimpleChatInputSchema },
  output: { schema: SimpleChatOutputSchema },
  model: googleAI.model('gemini-2.0-flash'),
  config: { temperature: 0.7, maxOutputTokens: 500 },
  prompt: `You are CropNavi Assistant, an expert agricultural AI chatbot for Indian farmers.

Help with: crop recommendations, disease detection, market prices, weather, sustainable farming, and government schemes.

Be friendly, practical, and concise (under 200 words). Reference CropNavi features when relevant.

User question: {{prompt}}`,
});

export async function aiChat(input: AIChatInput): Promise<AIChatOutput> {
  try {
    const { output } = await chatPrompt({ prompt: input.prompt });

    if (!output || !output.response) {
      throw new Error('No valid output from AI');
    }

    let response = output.response;

    if (input.language && input.language !== 'en') {
      const targetLanguageInfo = languages.find(l => l.code === input.language);
      if (targetLanguageInfo) {
        try {
          const translated = await translatePageContent({
            texts: [response],
            targetLanguage: targetLanguageInfo.name,
          });
          response = translated.translations[0];
        } catch (e) {
          console.error('Translation error:', e);
        }
      }
    }

    return { response };

  } catch (error) {
    console.error('AI Chat Error:', error);

    // Fallback response with error for debugging if needed, but keeping it clean for user
    let fallbackResponse = `I apologize, but I'm having trouble connecting right now (Error: ${error instanceof Error ? error.message : String(error)}). Please try again in a moment.`;

    if (input.language && input.language !== 'en') {
      const targetLanguageInfo = languages.find(l => l.code === input.language);
      if (targetLanguageInfo) {
        try {
          const translated = await translatePageContent({
            texts: [fallbackResponse],
            targetLanguage: targetLanguageInfo.name,
          });
          fallbackResponse = translated.translations[0];
        } catch (e) {
          // Keep English
        }
      }
    }

    return { response: fallbackResponse };
  }
}

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  aiChat
);
