import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { neon } from '@neondatabase/serverless';

export default function HomePage() {
  async function create(formData: FormData) {
    'use server';
    // Validate DATABASE_URL is set
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL is not configured');
      throw new Error('Database connection is not configured. Please contact support.');
    }

    try {
      // Connect to the Neon database
      const sql = neon(databaseUrl);
      const comment = formData.get('comment');

      if (!comment || typeof comment !== 'string') {
        throw new Error('Comment is required');
      }

      // Insert the comment from the form into the Postgres database
      await sql`INSERT INTO comments (comment) VALUES (${comment})`;
    } catch (error) {
      console.error('Error inserting comment:', error);
      throw new Error('Failed to save comment. Please try again.');
    }
  }
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="https://istani.store"
            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="font-bold text-lg">istani.store</span>
          </a>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-primary">
                Dashboard
              </Button>
            </Link>
            <Link href="/register">
              <Button size="default" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen px-4 pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background-dark to-background-dark" />

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="mb-8 text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl">
            EVIDENCE-BASED
            <span className="block text-primary mt-2">FITNESS SCIENCE</span>
          </h1>
          <p className="mb-12 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Transform your body with proven, science-backed training programs. Free tools, expert
            guidance, and a community dedicated to real results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                Start Training Free
              </Button>
            </Link>
            <Link href="/workouts">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-xl"
              >
                Browse Workouts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="px-4 py-24 bg-gradient-to-b from-background-dark to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center text-white mb-16">
            Everything You Need to Succeed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free Workouts */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">fitness_center</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Free Workout Programs</h3>
              <p className="text-white/70 leading-relaxed">
                Access professionally designed training programs for all fitness levels, completely
                free.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">monitoring</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Your Progress</h3>
              <p className="text-white/70 leading-relaxed">
                Log workouts, monitor strength gains, and visualize your transformation journey.
              </p>
            </div>

            {/* Nutrition Tools */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">restaurant</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nutrition Tracking</h3>
              <p className="text-white/70 leading-relaxed">
                Macro calculator, meal planner, and food database to fuel your fitness goals.
              </p>
            </div>

            {/* Science-Based */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">biotech</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Evidence-Based Training</h3>
              <p className="text-white/70 leading-relaxed">
                Programs backed by scientific research and proven training methodologies.
              </p>
            </div>

            {/* Community */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">groups</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Supportive Community</h3>
              <p className="text-white/70 leading-relaxed">
                Join a community of dedicated athletes achieving their goals together.
              </p>
            </div>

            {/* Analytics */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-primary/50 transition-all hover:scale-105">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-4xl">bar_chart</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Advanced Analytics</h3>
              <p className="text-white/70 leading-relaxed">
                Detailed insights and data visualization to optimize your training strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-br from-primary/10 to-background-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="mb-6 text-5xl md:text-6xl font-black text-white">
            Start Your Transformation Today
          </h2>
          <p className="mb-10 text-xl md:text-2xl text-white/90">
            Join thousands of athletes building strength, muscle, and confidence with science-backed
            training.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold px-12 py-8 text-xl rounded-xl shadow-2xl hover:shadow-primary/50 transition-all"
            >
              Get Started - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Comments Section */}
      <section className="px-4 py-20 bg-background-dark">
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-8 text-4xl font-bold text-white text-center">Share Your Thoughts</h2>
          <form action={create} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Leave a comment..."
              name="comment"
              className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Submit Comment
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">
            © 2024 Istani Fitness. Science-backed training for real results.
          </p>
          <a
            href="https://istani.store"
            className="inline-block mt-4 text-primary hover:text-primary/80 transition-colors"
          >
            Visit istani.store
          </a>
        </div>
      </footer>
    </div>
  );
}
