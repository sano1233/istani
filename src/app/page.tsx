'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [showLanding, setShowLanding] = useState(true);

  const handleStart = () => setShowLanding(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">✨</div>
                <span className="text-xl font-semibold tracking-tight">Istani</span>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                ☕ Support Us
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="relative mx-auto max-w-6xl text-center">
            <div className="mb-6 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-sm font-medium">
              🚀 Next-Gen Autonomous AI
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
              The World's Most Powerful{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Business AI Platform
              </span>
              {' '}Completely Free
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-300">
              Better than Replit, Palantir, Oracle, and Anduril. <span className="font-semibold text-white">Istani AI</span> solves every business challenge with autonomous AI that learns your business, integrates with your tools, and evolves as you grow.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleStart}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70"
              >
                <span className="relative z-10">Start Automating Now →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              <button
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="rounded-full border-2 border-white/20 px-8 py-4 text-lg font-semibold transition-all hover:border-white/40 hover:bg-white/5"
              >
                See What It Can Do
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Enterprise-Grade</span>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="border-t border-white/10 bg-gradient-to-b from-black to-gray-900 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-4 text-center text-3xl font-bold">Enterprise Solutions. Zero Cost.</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-gray-400">
              Real business tools that actually work. Not a demo. Not a trial. Forever free for every entrepreneur worldwide.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/50 to-black p-6 transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20">
                <div className="mb-4 text-4xl">🤖</div>
                <h3 className="mb-2 text-xl font-semibold text-blue-400">AI Receptionist & Automation</h3>
                <p className="text-gray-400">
                  Fully autonomous customer service that learns your business, handles inquiries 24/7, and integrates with your existing systems.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/50 to-black p-6 transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20">
                <div className="mb-4 text-4xl">📊</div>
                <h3 className="mb-2 text-xl font-semibold text-purple-400">Business Intelligence & Strategy</h3>
                <p className="text-gray-400">
                  Financial analysis, market research, competitive intelligence, and strategic planning powered by open source AI models.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-green-950/50 to-black p-6 transition-all hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/20">
                <div className="mb-4 text-4xl">🔧</div>
                <h3 className="mb-2 text-xl font-semibold text-green-400">Code & Technical Solutions</h3>
                <p className="text-gray-400">
                  Full stack development, API integration, database design, and technical problem solving. Better than paid coding assistants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-t border-white/10 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-12 text-3xl font-bold">Built with Bleeding-Edge Technology</h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 text-3xl">🤖</div>
                <div className="text-sm font-semibold">Gemini 2.0</div>
                <div className="text-xs text-gray-500">Quantum AI</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 text-3xl">🔓</div>
                <div className="text-sm font-semibold">100% Free</div>
                <div className="text-xs text-gray-500">Forever</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 text-3xl">🔗</div>
                <div className="text-sm font-semibold">MCP Protocol</div>
                <div className="text-xs text-gray-500">8 Integrations</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 text-3xl">🛡️</div>
                <div className="text-sm font-semibold">Enterprise Security</div>
                <div className="text-xs text-gray-500">Military Grade</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 bg-gradient-to-b from-black to-purple-950 px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Ready to Work Smarter, Not Harder?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Join the future of productivity. Your AI assistant is waiting.
            </p>

            <button
              onClick={handleStart}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-5 text-xl font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70"
            >
              <span className="relative z-10">Launch Istani AI →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            <p className="mt-6 text-sm text-gray-500">
              Free to start • Enterprise-grade • Built by{' '}
              <a href={process.env.NEXT_PUBLIC_SUPPORT_URL} className="text-purple-400 hover:underline">
                @istanifitn
              </a>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 py-8">
          <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
            <p>© 2025 Istani. Built with Claude Code, Gemini 2.0, and MCP.</p>
            <p className="mt-2">
              <a href={process.env.NEXT_PUBLIC_SUPPORT_URL} target="_blank" className="hover:text-white">
                Support Development
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowLanding(true)} className="flex items-center gap-2 transition-colors hover:text-purple-400">
              <div className="text-2xl">✨</div>
              <span className="text-xl font-semibold tracking-tight">Istani</span>
            </button>
            <a
              href={process.env.NEXT_PUBLIC_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              ☕ Support
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden pt-20">
        <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-5xl flex-col px-4 py-8">
          <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                <div className="text-6xl">✨</div>
                <h2 className="text-2xl font-bold">Your AI Assistant is Ready</h2>
                <p className="max-w-md text-gray-400">
                  Ask me anything. I can code, write, research, analyze, and solve complex problems in seconds.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'border border-white/10 bg-white/5 text-gray-100 backdrop-blur-sm'
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold opacity-70">
                    {message.role === 'user' ? 'You' : 'Istani AI'}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0.4s' }} />
                    <span className="ml-2 text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="What do you need help with?"
              className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100"
            >
              Send
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-600">
            Powered by Gemini 2.0 Flash • Quantum Intelligence • Autonomous Reasoning
          </p>
        </div>
      </main>
    </div>
  );
}
