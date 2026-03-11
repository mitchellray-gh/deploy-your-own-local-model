import { createGroq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

// Web search can take longer, cap at 30s otherwise
export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fast conversational model — no web search overhead
const CHAT_MODEL = 'llama-3.3-70b-versatile';
// Required for Groq browser search tool
const SEARCH_MODEL = 'openai/gpt-oss-20b';

export async function POST(req: Request) {
  const { messages, webSearch }: { messages: UIMessage[]; webSearch: boolean } =
    await req.json();

  // Only send the last 10 messages to keep the payload lean
  const recentMessages = messages.slice(-10);

  const result = streamText({
    model: groq(webSearch ? SEARCH_MODEL : CHAT_MODEL),
    system: webSearch
      ? 'You are a helpful assistant. Use the browser search tool to find current information. Be concise and cite sources.'
      : 'You are a helpful assistant. Be concise.',
    messages: await convertToModelMessages(recentMessages),
    maxOutputTokens: 1024,
    ...(webSearch && {
      tools: {
        browser_search: groq.tools.browserSearch({}),
      },
    }),
  });

  return result.toUIMessageStreamResponse();
}
