
/**
 * @fileOverview Schemas for the disease detection flow.
 */

import {z} from 'zod';

export const AIDiseaseDetectionInputSchema = z.object({
    photoDataUri: z
      .string()
      .describe(
        "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  });
  export type AIDiseaseDetectionInput = z.infer<typeof AIDiseaseDetectionInputSchema>;
  
  export const AIDiseaseDetectionOutputSchema = z.object({
    diseaseName: z.string().describe('The common name of the identified disease. If no disease is detected or the plant is healthy, this should be "Healthy".'),
    confidence: z.number().describe('The confidence level of the diagnosis (from 0 to 1). For a healthy plant, this can be high (e.g., 0.95).'),
    description: z.string().describe('A description of the disease, its symptoms, and potential treatments. If healthy, confirm its state.'),
  });
  export type AIDiseaseDetectionOutput = z.infer<typeof AIDiseaseDetectionOutputSchema>;
  
