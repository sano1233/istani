import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { neon } from '@neondatabase/serverless';

export default function HomePage() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }
  return (
    <div className="min-h-screen relative">
      {/* Hero Section with Futuristic Design */}
      <section className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-neon-cyan/5 to-neon-purple/10 animate-gradient-shift" />

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative z-10 max-w-5xl mx-auto text-center animate-slide-up">
          {/* Glowing badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-card">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse-glow" />
            <span className="text-sm font-semibold text-white/80">Powered by AI & Science</span>
          </div>

          <h1 className="mb-6 text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl">
            TRANSFORM YOUR
            <span className="gradient-text block mt-2"> FITNESS</span>
          </h1>
          <p className="mb-12 text-xl text-white/70 md:text-2xl max-w-3xl mx-auto">
            Experience the future of fitness with AI-powered training, real-time analytics, and premium supplements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <button className="neon-button text-lg px-8 py-4">
                <span className="relative z-10">Explore Products</span>
              </button>
            </Link>
            <Link href="/register">
              <button className="glass-card hover:shadow-glow-cyan px-8 py-4 rounded-xl text-lg font-bold text-white transition-all hover:scale-105">
                Start Free Trial
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="glass-card p-6 card-hover-glow">
              <div className="text-4xl font-black gradient-text mb-2">10K+</div>
              <div className="text-sm text-white/60">Active Members</div>
            </div>
            <div className="glass-card p-6 card-hover-glow">
              <div className="text-4xl font-black gradient-text mb-2">50M+</div>
              <div className="text-sm text-white/60">Workouts Completed</div>
            </div>
            <div className="glass-card p-6 card-hover-glow">
              <div className="text-4xl font-black gradient-text mb-2">98%</div>
              <div className="text-sm text-white/60">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Glass Morphism */}
      <section className="px-4 py-32 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl font-black text-white mb-4">
              Why Choose <span className="gradient-text">ISTANI</span>
            </h2>
            <p className="text-xl text-white/60">The future of fitness is here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 card-hover-glow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center mb-6 shadow-glow-md group-hover:shadow-glow-lg transition-all">
                <span className="material-symbols-outlined text-white text-4xl">science</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 neon-underline">
                AI-Powered Science
              </h3>
              <p className="text-white/60 leading-relaxed">
                Evidence-based training programs powered by artificial intelligence and backed by scientific research for optimal results.
              </p>
            </div>

            <div className="glass-card p-8 card-hover-glow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-cyber flex items-center justify-center mb-6 shadow-glow-cyan group-hover:shadow-glow-lg transition-all">
                <span className="material-symbols-outlined text-white text-4xl">
                  monitoring
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 neon-underline">
                Real-Time Analytics
              </h3>
              <p className="text-white/60 leading-relaxed">
                Track every metric with advanced analytics and visualizations. See your progress in real-time and stay motivated.
              </p>
            </div>

            <div className="glass-card p-8 card-hover-glow group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center mb-6 shadow-glow-purple group-hover:shadow-glow-lg transition-all">
                <span className="material-symbols-outlined text-white text-4xl">
                  shopping_bag
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 neon-underline">
                Premium Products
              </h3>
              <p className="text-white/60 leading-relaxed">
                High-quality supplements and equipment tested and approved by professional athletes and nutritionists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Holographic Effect */}
      <section className="px-4 py-32 relative overflow-hidden">
        <div className="absolute inset-0 holographic opacity-30" />
        <div className="absolute inset-0 cyber-grid opacity-20" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="glass-card p-16 neon-border animate-pulse-glow">
            <h2 className="mb-6 text-5xl md:text-6xl font-black text-white">
              Ready to <span className="gradient-text">Transform?</span>
            </h2>
            <p className="mb-10 text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
              Join thousands of athletes achieving their fitness goals with cutting-edge technology and personalized coaching.
            </p>
            <Link href="/register">
              <button className="neon-button text-xl px-12 py-5 animate-scale-in">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Today
                  <span className="material-symbols-outlined">arrow_forward</span>
                </span>
              </button>
            </Link>

            <div className="mt-12 flex items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-neon-green">check_circle</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-neon-green">check_circle</span>
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section with Futuristic Input */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-8 text-4xl font-bold text-white text-center">
            Share Your <span className="gradient-text">Feedback</span>
          </h2>
          <form action={create} className="glass-card p-8 flex flex-col gap-6">
            <input
              type="text"
              placeholder="Share your thoughts..."
              name="comment"
              className="neon-input"
              required
            />
            <button type="submit" className="neon-button text-lg py-4">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">send</span>
                Submit Comment
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* Footer Accent */}
      <div className="h-1 bg-gradient-neon" />
    </div>
  );
}
