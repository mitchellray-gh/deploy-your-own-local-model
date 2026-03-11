# AI Chat with Web Search

An AI chatbot powered by an **open-source model** (`openai/gpt-oss-20b`) hosted on [Groq](https://groq.com), with **built-in web search** capabilities. Built with Next.js and the Vercel AI SDK — deployable to Vercel with one click.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| AI SDK | Vercel AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`) |
| Model | `openai/gpt-oss-20b` — open-source, hosted on Groq |
| Web Search | Groq Browser Search (powered by Exa, free during beta) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Getting Started

### 1. Get a Groq API Key

Sign up at [console.groq.com](https://console.groq.com) and create a free API key.

### 2. Set Environment Variable

Edit `.env.local` and add your key:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx          # Chat UI (client component)
    layout.tsx        # Root layout
    globals.css       # Tailwind styles
    api/
      chat/
        route.ts      # POST endpoint — streams AI responses
```

## How It Works

1. **User sends a message** → `page.tsx` calls `sendMessage()` via `useChat` hook
2. **API route receives it** → `route.ts` calls `streamText()` with the Groq provider
3. **Model decides to search** → Groq's built-in `browserSearch` tool fetches live web results
4. **Response streams back** → Real-time token streaming to the chat UI

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add `GROQ_API_KEY` as an environment variable
4. Deploy ✅

## Switching Models

In `src/app/api/chat/route.ts`, swap the model string:

```ts
// Leaner & faster (20B params)
model: groq('openai/gpt-oss-20b'),

// Larger & more capable (120B params)
model: groq('openai/gpt-oss-120b'),
```

Both models support the browser search tool. See [Groq models](https://console.groq.com/docs/models) for the full list.

## License

MIT
