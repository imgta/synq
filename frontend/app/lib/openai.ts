import OpenAI from 'openai';

export interface OpenAIGenerateParams {
  systemPrompt: string;
  userPrompt: string;
  history?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

/**
 * Generates AI content using OpenAI's chat completion model with the provided system and user prompts.
 * Optionally supports chat history, temperature adjustment.
 * 
 * @param {object} params - The arguments for generating AI content.
 * @param {string} params.systemPrompt - The system instruction or context provided to the AI model.
 * @param {string} params.userPrompt - The user's prompt or question for generating content.
 * @param {OpenAI.Chat.Completions.ChatCompletionMessageParam[]} [params.history] - Optional chat history for context in conversational AI scenarios.
 * @param {string} [params.model] - Optional model ID to use for content generation. Defaults to 'gpt-4.1-nano'.
 * @param {number} [params.temperature] - Optional temperature value for controlling randomness in output. Defaults to 0.
 * @returns {Promise<string>} The generated AI content based on the user's prompt.
 * 
 * @throws {Error} Throws a 500 error if AI generation fails, or a 400 error if the output contains a potential prompt hacking attempt.
 */
export async function openAiGenerate({
  systemPrompt,
  userPrompt,
  history = [],
  model = 'gpt-4.1-nano',
  temperature = 0,
  maxTokens = 32_768,
  apiKey,
}: OpenAIGenerateParams) {
  const openai = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userPrompt },
  ];

  const res = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  const output = res.choices[0]?.message.content;
  if (!output) throw new Error('Response generation failed');

  return output;
}