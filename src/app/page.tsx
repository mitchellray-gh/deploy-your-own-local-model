'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Home() {
  const [webSearch, setWebSearch] = useState(true);
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        webSearch,
        userDateTime: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        }),
      },
    }),
  });
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Chat</h1>
            <p className="text-xs text-gray-400">
              Powered by GPT-OSS ·{' '}
              {webSearch ? 'Web search enabled' : 'Web search off'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Web search toggle */}
          <button
            onClick={() => setWebSearch((v) => !v)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-40 ${
              webSearch
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🌐 Web search {webSearch ? 'on' : 'off'}
          </button>
          <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-800">
            {status === 'ready'
              ? '● Ready'
              : status === 'streaming'
                ? '◉ Streaming'
                : status === 'submitted'
                  ? '○ Thinking...'
                  : '✕ Error'}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
            <div className="text-5xl">🔍</div>
            <p className="text-lg font-medium">Ask me anything</p>
            <p className="text-sm text-gray-600 text-center max-w-md">
              I can search the web for current information. Try asking about
              recent news, weather, sports scores, or any topic you&apos;re
              curious about.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return (
                    <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
                      {part.text}
                    </div>
                  );
                }

                if (part.type === 'tool-invocation') {
                  return (
                    <div
                      key={index}
                      className="my-2 px-3 py-2 bg-gray-700/50 rounded-lg text-xs text-gray-400 flex items-center gap-2"
                    >
                      <span className="animate-pulse">🌐</span>
                      Searching the web
                      {part.state === 'output-available' ? ' ✓' : '...'}
                    </div>
                  );
                }

                if (part.type === 'source-url') {
                  return (
                    <a
                      key={index}
                      href={part.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 mr-1 px-2 py-0.5 bg-gray-700 text-indigo-400 text-xs rounded hover:bg-gray-600 transition"
                    >
                      {part.title ?? new URL(part.url).hostname}
                    </a>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}

        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-2 text-sm">
              Error: {error.message || 'Something went wrong.'}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              sendMessage({ text: input });
              setInput('');
            }
          }}
          className="flex gap-3 max-w-3xl mx-auto"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything... try 'latest AI news' or 'weather in NYC'"
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:opacity-50"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition"
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
