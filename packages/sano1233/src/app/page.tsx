import Link from "next/link";
import { Dumbbell, Brain, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold">FitAI</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-red-400 transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Transform Your Fitness Journey with{" "}
          <span className="text-red-500">AI</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Get personalized workout plans, nutrition guidance, and real-time
          coaching powered by advanced AI technology
        </p>
        <Link
          href="/register"
          className="inline-block bg-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition"
        >
          Start Free Trial
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose FitAI?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Brain className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Plans</h3>
            <p className="text-gray-400">
              Custom workout and nutrition plans tailored to your goals and
              fitness level
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Zap className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Adaptation</h3>
            <p className="text-gray-400">
              Plans that evolve with your progress and adapt to your needs
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <TrendingUp className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-400">
              Comprehensive analytics to monitor your fitness journey
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <Dumbbell className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-400">
              AI trained on professional fitness knowledge and best practices
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of users transforming their fitness with AI
        </p>
        <Link
          href="/register"
          className="inline-block bg-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition"
        >
          Start Your Journey Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 FitAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
