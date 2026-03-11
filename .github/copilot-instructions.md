<!-- Workspace-specific custom instructions for Copilot -->

## Project: AI Chatbot with Web Search

- **Framework:** Next.js (App Router) with TypeScript
- **AI SDK:** Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`)
- **Model:** Groq-hosted open-source model with built-in web search
- **Deployment:** Vercel

### Development Notes
- Use the App Router (`app/` directory) for all routes
- API routes go in `app/api/`
- Use Vercel AI SDK streaming helpers for chat endpoints
- Environment variable `GROQ_API_KEY` is required
