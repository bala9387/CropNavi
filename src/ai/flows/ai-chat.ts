
'use server';

/**
 * @fileOverview A conversational AI flow for a general-purpose chatbot.
 *
 * - aiChat - A function that takes conversation history and a prompt, and returns a response.
 */

import {ai} from '@/ai/genkit';
import { AIChatInput, AIChatOutput, AIChatInputSchema, AIChatOutputSchema } from './ai-chat.schemas';
import { translatePageContent } from './translate-page-content';
import { languages } from '@/lib/languages';
import { getWeatherData } from '../tools/get-weather-data';


  export async function aiChat(
    input: AIChatInput
  ): Promise<AIChatOutput> {

    const prompt = input.prompt.toLowerCase();
    let response = "I'm sorry, I'm not sure how to help with that. I can assist with crop recommendations, disease detection, and market prices. Please try asking about one of those topics.";

    if (prompt.includes('crop') || prompt.includes('recommend') || prompt.includes('grow')) {
      response = "It sounds like you're looking for crop recommendations. You can find the 'Crop Recommendation' tool in the dashboard. It uses AI to give you suggestions based on your farm's data.";
    } else if (prompt.includes('disease') || prompt.includes('sick') || prompt.includes('leaf')) {
      response = "For help with plant diseases, please use the 'AI Disease Detection' feature. You can upload a photo of the affected plant, and the AI will help diagnose the issue.";
    } else if (prompt.includes('market') || prompt.includes('price') || prompt.includes('sell')) {
      response = "You can analyze crop prices and market trends on the 'Market Analysis' page. It can help you decide the best time to sell your harvest.";
    } else if (prompt.includes('weather') || prompt.includes('forecast')) {
        const weather = await getWeatherData({latitude: 23.3441, longitude: 85.3096});
        response = `The current temperature is ${weather.current.temperature}°C with ${weather.current.humidity}% humidity. The forecast for tomorrow is: ${weather.forecast[1].description} with a high of ${weather.forecast[1].maxTemp}°C. You can see a detailed 7-day forecast on your dashboard.`;
    }
    else if (prompt.includes('hello') || prompt.includes('hi') || prompt.includes('help')) {
      response = "Hello! I'm CropNavi, your agricultural assistant. I can help you with crop recommendations, disease detection, and market analysis. How can I assist you today?";
    }
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (input.language && input.language !== 'en') {
      const targetLanguageInfo = languages.find(l => l.code === input.language);
      if (targetLanguageInfo) {
        const translatedResponse = await translatePageContent({
          texts: [response],
          targetLanguage: targetLanguageInfo.name,
        });
        response = translatedResponse.translations[0];
      }
    }

    return { response };
  }

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  aiChat
);
