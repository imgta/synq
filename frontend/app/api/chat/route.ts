import { type UIMessage, convertToModelMessages, streamText, hasToolCall, stepCountIs, tool } from 'ai';
import { getNaicsCandidates, summarizeBusiness, selectTopNaics } from '@/actions/naics.server';
import { findJVPartners } from '@/actions/partners.server';
import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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
      // tool #1
      classifyBusinessByNAICS: tool({
        description: 'Given a detailed natural language **business description**, this tool identifies and describes potential NAICS codes that fit the company\'s capabilities. Only use this for classifying a company, not for looking up existing codes.',
        inputSchema: z.object({
          description: z.string().describe('A description of a business or company to find relevant NAICS codes for.'),
        }),
        execute: async ({ description }) => {
          const summary = await summarizeBusiness({ description, model });

          const candidates = await getNaicsCandidates(summary);
          if (!candidates?.length) return { error: 'No relevant NAICS codes found.' };

          const naicsCodes = await selectTopNaics({ description, summary, candidates, model });

          return { naicsCodes, summary, candidates };
        },
      }),
      // tool #2
      findJVPartners,
    },
    stopWhen: [
      hasToolCall('classifyBusinessByNAICS'),
      hasToolCall('findJVPartners'),
      stepCountIs(0),
    ],
  });
  return result.toUIMessageStreamResponse();
}

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/chat' });
}