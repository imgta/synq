import { streamText, convertToModelMessages, tool, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const runtime = 'edge';

interface StreamAIRequestBody {
  system: string;
  messages: UIMessage[];
  temperature: number;
  model: string;
}

export async function POST(req: Request) {
  const {
    model = 'gpt-4.1-nano',
    temperature = 0,
    system,
    messages,
  }: StreamAIRequestBody = await req.json();

  const result = streamText({
    model: openai(model),
    temperature,
    system,
    messages: convertToModelMessages(messages),
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}