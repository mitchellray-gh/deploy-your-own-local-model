import { createGroq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fast conversational model — no web search overhead
const CHAT_MODEL = 'llama-3.3-70b-versatile';
// gpt-oss-20b is the only model supporting browser search
const SEARCH_MODEL = 'openai/gpt-oss-20b';

export async function POST(req: Request) {
  const {
    messages,
    webSearch,
    userDateTime,
  }: { messages: UIMessage[]; webSearch: boolean; userDateTime: string } =
    await req.json();

  const dateContext = userDateTime
    ? `The user's current local date and time is: ${userDateTime}.`
    : '';

  // Fewer messages for search to minimise token processing time
  const recentMessages = messages.slice(webSearch ? -4 : -10);

  try {
    const result = streamText({
      model: groq(webSearch ? SEARCH_MODEL : CHAT_MODEL),
      system: webSearch
        ? `You are a helpful assistant. ${dateContext} Search the web only when needed. Be concise. Cite sources inline.`
        : `You are a helpful assistant. ${dateContext} Be concise.`,
      messages: await convertToModelMessages(recentMessages),
      maxOutputTokens: webSearch ? 512 : 1024,
      ...(webSearch && {
        tools: {
          browser_search: groq.tools.browserSearch({}),
        },
        toolChoice: 'auto',
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    // If rate limited on search model, fallback to chat model without search
    const isRateLimit =
      error instanceof Error && error.message?.includes('Rate limit');

    if (isRateLimit && webSearch) {
      const fallback = streamText({
        model: groq(CHAT_MODEL),
        system: `You are a helpful assistant. ${dateContext} Be concise. Note: web search is temporarily unavailable due to rate limits — answer from your own knowledge.`,
        messages: await convertToModelMessages(recentMessages),
        maxOutputTokens: 1024,
      });

      return fallback.toUIMessageStreamResponse();
    }

    // Return a useful error message
    return new Response(
      JSON.stringify({
        error: isRateLimit
          ? 'Rate limit reached. Try again in a few minutes.'
          : 'Something went wrong.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
