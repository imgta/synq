import { streamText, convertToModelMessages, tool, UIMessage, generateText, generateObject, hasToolCall } from 'ai';
import { findNaicsCandidates } from '@/api/_actions/find-naics';
import { findJVPartners } from '@/api/_actions/find-partners';
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
          description: z.string().describe('A comprehensive description of the business for classification.'),
        }),
        execute: async ({ description }) => {
          const { text: summary } = await generateText({
            model: openai(model),
            prompt: `You are an expert business analyst specialized in writing in-depth documents that provide industry analysis and technical summary for a business based on its description. Your task is to analyze the business description and draft a formal, government official document with comprehensive analysis and details that describe the business.

Here's the business description:
<description>
${description}
</description>

Follow these guidelines:
1. Analyze the business description and focus on core economic activities and industry relevance and overlaps.
2. Write objectively, using formal, bureaucratic wording similar to government documents.
3. Do not include the business name or any specific NAICS codes.`,
          });
          const candidates = await findNaicsCandidates(summary, 10);
          if (!candidates || candidates.length === 0) return { error: 'No relevant NAICS codes found.' };
          const { object: analysis } = await generateObject({
            model: openai(model),
            schema: z.object({
              selections: z.array(z.object({
                code: z.string(),
                level: z.string(),
                title: z.string(),
                justification: z.string().describe('A brief explanation for why the NAICS code is a strong match for the business.'),
              })).describe('An array of the top 5 most relevant NAICS codes, re-ranked from the provided candidates.'),
            }),
            prompt: `You are an expert U.S. government contracting analyst. Your task is to provide a final, justified selection of NAICS codes based on the following briefing.

Original business description:
<description>
${description}
</description>

Expert analysis summary:
<summary>
${summary}
</summary>

Candidate NAICS codes:
<naics_codes>
${JSON.stringify(candidates, null, 2)}
</naics_codes>

**Important Instructions:**
1. Review all sections carefully to better understand the overall business industry and fit.
2. Select 5 highly specific NAICS codes from the candidate list that are most relevant to the business.
3. Write a concise justification for each selection:
  a. Justifications MUST connect concepts from the original description to language found in NAICS code descriptions.
  b. Expert analysis summaries can guide connections, but justifications are framed in terms of the original description for clarity.`,
          });
          return { naicsCodes: analysis.selections };
        },
      }),
      // tool #2
      findJVPartners,
    },
    stopWhen: [
      hasToolCall('classifyBusinessByNAICS'),
      hasToolCall('findJVPartners'),
    ],
  });
  return result.toUIMessageStreamResponse();
}