
import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/ai/flows/ai-chat';
import { AIChatInputSchema } from '@/ai/flows/ai-chat.schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedBody = AIChatInputSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const output = await aiChat(validatedBody.data);
    return NextResponse.json(output);
  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
