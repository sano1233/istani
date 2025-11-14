import Link from 'next/link'
import { Dumbbell, Home, TrendingUp, UtensilsCrossed, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">FitAI</span>
            </div>
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/workouts"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <Dumbbell className="h-5 w-5" />
                  Workouts
                </Link>
                <Link
                  href="/nutrition"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  Nutrition
                </Link>
                <Link
                  href="/progress"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <TrendingUp className="h-5 w-5" />
                  Progress
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
