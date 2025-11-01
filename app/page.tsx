import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Istani Autonomous AI Platform
          </h1>

          <p className="text-xl text-gray-300 mb-12">
            Production-ready AI security and API orchestration with defense-in-depth protection
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">🛡️ Defense-in-Depth Security</h3>
              <p className="text-gray-300">
                5-layer prompt injection prevention with token logprobs confidence scoring achieving 95% precision
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">🤖 Multi-AI Orchestration</h3>
              <p className="text-gray-300">
                Autonomous analysis with Claude, Gemini, OpenAI, and Qwen achieving consensus-based decisions
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">⚡ Edge Computing</h3>
              <p className="text-gray-300">
                Cloudflare KV, R2, Workers AI, and Browser Rendering for global sub-10ms latency
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">🔄 Fully Autonomous</h3>
              <p className="text-gray-300">
                Auto-analyze, auto-resolve, and auto-merge with confidence thresholds ≥0.99
              </p>
            </div>
          </div>

          {/* API Integrations */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-12 border border-white/20">
            <h2 className="text-3xl font-bold mb-6">Integrated Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-white/5 rounded">OpenAI GPT-4o</div>
              <div className="p-3 bg-white/5 rounded">Anthropic Claude</div>
              <div className="p-3 bg-white/5 rounded">Google Gemini</div>
              <div className="p-3 bg-white/5 rounded">Alibaba Qwen</div>
              <div className="p-3 bg-white/5 rounded">Cloudflare KV</div>
              <div className="p-3 bg-white/5 rounded">Cloudflare R2</div>
              <div className="p-3 bg-white/5 rounded">Stripe Payments</div>
              <div className="p-3 bg-white/5 rounded">Hugging Face</div>
              <div className="p-3 bg-white/5 rounded">PubMed Research</div>
              <div className="p-3 bg-white/5 rounded">Upstash Redis</div>
              <div className="p-3 bg-white/5 rounded">Vercel Edge</div>
              <div className="p-3 bg-white/5 rounded">GitHub Actions</div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
            <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
            <div className="space-y-4 text-left">
              <div className="border-l-4 border-purple-500 pl-4">
                <code className="text-purple-300">POST /api/ai/generate</code>
                <p className="text-gray-400 mt-1">Secure AI generation with confidence scoring</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <code className="text-blue-300">POST /api/autonomous/analyze</code>
                <p className="text-gray-400 mt-1">Multi-AI autonomous analysis</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <code className="text-green-300">POST /api/webhooks/github</code>
                <p className="text-gray-400 mt-1">Auto-analyze and auto-merge PRs</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <code className="text-yellow-300">GET /api/health</code>
                <p className="text-gray-400 mt-1">System health and AI service status</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-gray-400">
            <p className="mb-4">
              Powered by Next.js 15, TypeScript, and modern ES modules
            </p>
            <p className="text-sm">
              Defense-in-depth security • Zero API key exposure • Sub-10ms edge latency
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
