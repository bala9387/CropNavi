/**
 * @fileOverview Schemas for the batch text translation flow.
 */

import {z} from 'zod';

export const TranslatePageContentInputSchema = z.object({
  texts: z
    .array(z.string())
    .describe(
      'An array of strings to be translated.'
    ),
  targetLanguage: z
    .string()
    .describe(
      'The language to translate the text into (e.g., "Hindi", "Tamil").'
    ),
});
export type TranslatePageContentInput = z.infer<
  typeof TranslatePageContentInputSchema
>;

export const TranslatePageContentOutputSchema = z.object({
  translations: z.array(z.string()).describe('The array of translated strings, in the same order as the input.'),
});
export type TranslatePageContentOutput = z.infer<
  typeof TranslatePageContentOutputSchema
>;
