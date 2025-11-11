import Link from 'next/link'
import { ArrowRight, Dumbbell, TrendingUp, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-brand-primary" />
              <span className="text-2xl font-display font-bold text-brand-dark">Istani</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-brand-primary transition">
                Shop
              </Link>
              <Link href="/coaching" className="text-gray-700 hover:text-brand-primary transition">
                Coaching
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-brand-primary transition">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
              Transform Your Body,<br />Transform Your Life
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 animate-fade-in animation-delay-200">
              The complete fitness platform with AI-powered coaching, personalized workouts, and science-based nutrition guidance
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-400">
              <Link href="/register" className="btn-primary bg-white text-brand-primary hover:bg-gray-100 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/coaching" className="btn-outline border-white text-white hover:bg-white hover:text-brand-primary">
                View Coaching Plans
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-white/80">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">1M+</div>
              <div className="text-white/80">Workouts Logged</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-white/80">Goal Achievement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From beginner to elite athlete, our platform adapts to your goals and fitness level
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Smart Workouts</h3>
              <p className="text-gray-600">
                AI-generated workout plans that adapt to your progress, equipment, and schedule
              </p>
            </div>

            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-fitness-nutrition to-brand-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Nutrition Tracking</h3>
              <p className="text-gray-600">
                Science-based macro calculations with real-time meal logging and AI suggestions
              </p>
            </div>

            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-secondary to-fitness-strength rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Elite Coaching</h3>
              <p className="text-gray-600">
                1-on-1 coaching with certified experts. From $297 onboarding to $1,997/mo elite plans
              </p>
            </div>

            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-fitness-cardio to-brand-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Progress Analytics</h3>
              <p className="text-gray-600">
                Advanced body composition analysis, strength progression, and AI-powered insights
              </p>
            </div>

            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-fitness-flexibility to-fitness-strength rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Voice Assistant</h3>
              <p className="text-gray-600">
                ElevenLabs AI voice coach for hands-free workout logging and real-time form tips
              </p>
            </div>

            <div className="card group hover:border-brand-primary border-2 border-transparent">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-accent to-fitness-cardio rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Premium Shop</h3>
              <p className="text-gray-600">
                Curated supplements, equipment, and apparel from trusted fitness brands
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Join 50,000+ members who have already transformed their lives with Istani Fitness
          </p>
          <Link href="/register" className="btn-primary bg-white text-brand-primary hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center gap-2">
            Start Your Free Trial
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="w-8 h-8 text-brand-primary" />
                <span className="text-2xl font-display font-bold">Istani</span>
              </div>
              <p className="text-gray-400">
                Transform your body, transform your life
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-brand-primary transition">Shop</Link></li>
                <li><Link href="/coaching" className="hover:text-brand-primary transition">Coaching</Link></li>
                <li><Link href="/dashboard" className="hover:text-brand-primary transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:istaniDOTstore@proton.me" className="hover:text-brand-primary transition">Contact</a></li>
                <li><a href="https://buymeacoffee.com/istanifitn" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition">Donate</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Connect</h4>
              <p className="text-gray-400 mb-2">istaniDOTstore@proton.me</p>
              <a
                href="https://buymeacoffee.com/istanifitn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg transition"
              >
                ☕ Buy Me a Coffee
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Istani Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
