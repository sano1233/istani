'use client'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/fitness" className="flex items-center space-x-2">
            <Dumbbell className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Istani Fitness</span>
          </Link>
          <nav className="flex space-x-6">
            <Link href="/fitness/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/fitness/workouts" className="text-gray-300 hover:text-white">Workouts</Link>
            <Link href="/fitness/nutrition" className="text-gray-300 hover:text-white">Nutrition</Link>
            <Link href="/fitness/booking" className="text-gray-300 hover:text-white">Book</Link>
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-xl text-gray-300">Coming soon...</p>
      </div>
    </div>
  )
}
