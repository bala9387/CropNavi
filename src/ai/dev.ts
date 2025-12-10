import { config } from 'dotenv';
config();

import '@/ai/flows/ai-crop-recommendation-from-prompt.ts';
import '@/ai/flows/ai-disease-detection.ts';
import '@/ai/flows/calculate-sustainability-score.ts';
import '@/ai/flows/summarize-market-data.ts';
import '@/ai/flows/ai-chat.ts';
import '@/ai/flows/translate-page-content.ts';
import '@/ai/tools/get-weather-data';
import '@/ai/flows/ai-crop-recommendation-from-prompt.schemas';
import '@/ai/flows/ai-disease-detection.schemas';
import '@/ai/flows/calculate-sustainability-score.schemas';
import '@/ai/flows/summarize-market-data.schemas';
import '@/ai/flows/ai-chat.schemas';
import '@/ai/flows/translate-page-content.schemas';
