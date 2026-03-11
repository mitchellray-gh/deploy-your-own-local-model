import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, webSearch }: { messages: UIMessage[]; webSearch: boolean } =
    await req.json();

  const result = streamText({
    model: groq('openai/gpt-oss-20b'),
    system: webSearch
      ? 'You are a helpful AI assistant with web search capabilities. ' +
        'When the user asks about current events, recent news, or anything that ' +
        'requires up-to-date information, use the browser search tool to find ' +
        'accurate and current results. Always cite your sources when using search.'
      : 'You are a helpful AI assistant.',
    messages: await convertToModelMessages(messages),
    ...(webSearch && {
      tools: {
        browser_search: groq.tools.browserSearch({}),
      },
    }),
  });

  return result.toUIMessageStreamResponse();
}
