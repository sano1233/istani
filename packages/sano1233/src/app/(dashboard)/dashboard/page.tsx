import { Dumbbell, TrendingUp, Target, Calendar } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's your fitness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Dumbbell className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">12</h3>
          <p className="text-gray-600 text-sm">Workouts Completed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">2.5 kg</h3>
          <p className="text-gray-600 text-sm">Progress This Month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">85%</h3>
          <p className="text-gray-600 text-sm">Goal Achievement</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">4</h3>
          <p className="text-gray-600 text-sm">Week Streak</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="p-2 bg-red-100 rounded">
              <Dumbbell className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Chest & Triceps Workout</p>
              <p className="text-sm text-gray-600">Completed today at 9:30 AM</p>
            </div>
            <span className="text-sm text-gray-500">45 min</span>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="p-2 bg-red-100 rounded">
              <Dumbbell className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Back & Biceps Workout</p>
              <p className="text-sm text-gray-600">Completed yesterday at 6:00 PM</p>
            </div>
            <span className="text-sm text-gray-500">50 min</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded">
              <Dumbbell className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Leg Day</p>
              <p className="text-sm text-gray-600">Completed 2 days ago at 7:30 AM</p>
            </div>
            <span className="text-sm text-gray-500">60 min</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg shadow-sm text-white">
        <h2 className="text-xl font-bold mb-2">AI Recommendation</h2>
        <p className="mb-4">
          Based on your recent progress, consider increasing the weight on your compound lifts by 5-10%.
          Your consistency has been excellent!
        </p>
        <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          View Detailed Analysis
        </button>
      </div>
    </div>
  )
}
