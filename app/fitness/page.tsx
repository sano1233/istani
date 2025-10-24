'use client'

import Link from 'next/link'
import { Dumbbell, Heart, Users, TrendingUp, Calendar, Apple, Zap, Award } from 'lucide-react'

export default function FitnessHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed w-full bg-black/30 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Istani Fitness</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/fitness/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
              <Link href="/fitness/workouts" className="text-gray-300 hover:text-white">Workouts</Link>
              <Link href="/fitness/nutrition" className="text-gray-300 hover:text-white">Nutrition</Link>
              <Link href="/fitness/booking" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Transform Your
            <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Fitness Journey
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join Istani Fitness Enterprises - AI-powered coaching meets personalized training.
          </p>
          <Link href="/fitness/dashboard" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold">
            Start Free Trial
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Dumbbell, title: 'Custom Workouts' },
              { icon: Apple, title: 'Nutrition Plans' },
              { icon: Calendar, title: 'Easy Scheduling' },
              { icon: TrendingUp, title: 'Progress Tracking' },
              { icon: Users, title: 'Community' },
              { icon: Heart, title: 'Wellness' },
              { icon: Zap, title: '24/7 AI Coach' },
              { icon: Award, title: 'Achievements' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <f.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white">{f.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black/50 py-12 px-4">
        <p className="text-center text-gray-400">&copy; 2024 Istani Fitness Enterprises</p>
      </footer>
    </div>
  )
}
