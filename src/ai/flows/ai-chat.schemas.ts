
/**
 * @fileOverview Schemas for the AI chat flow.
 */

import {z} from 'zod';

export const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

export const AIChatInputSchema = z.object({
    history: z.array(MessageSchema).describe("The history of the conversation."),
    prompt: z.string().describe('The user’s latest message or question.'),
    language: z.string().optional().describe('The target language for the response.'),
  });
  export type AIChatInput = z.infer<typeof AIChatInputSchema>;
  
  export const AIChatOutputSchema = z.object({
    response: z.string().describe('The AI model\'s response to the user\'s prompt.'),
  });
  export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;


