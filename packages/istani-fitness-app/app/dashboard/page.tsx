import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Apple, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = [
    {
      title: 'Workouts This Week',
      value: '3',
      change: '+2 from last week',
      icon: Dumbbell,
      color: 'text-green-500',
    },
    {
      title: 'Calories Today',
      value: '1,850',
      change: 'Goal: 2,000',
      icon: Apple,
      color: 'text-orange-500',
    },
    {
      title: 'Weight Progress',
      value: '-2.5 lbs',
      change: 'This month',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Streak',
      value: '7 days',
      change: 'Keep it up!',
      icon: Calendar,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.user_metadata?.name || 'there'}!</h1>
        <p className="text-muted-foreground">
          Here's your fitness overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Start a Workout</CardTitle>
            <CardDescription>
              Choose from your personalized workout plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/dashboard/workouts">
                <Dumbbell className="mr-2 h-4 w-4" />
                View Workouts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Log Your Meals</CardTitle>
            <CardDescription>
              Track your nutrition and calories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/dashboard/meals">
                <Apple className="mr-2 h-4 w-4" />
                Log Meal
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Progress</CardTitle>
            <CardDescription>
              Update your weight and measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/dashboard/progress">
                <TrendingUp className="mr-2 h-4 w-4" />
                Log Progress
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest workouts and meals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
                <Dumbbell className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Upper Body Strength</p>
                <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
              </div>
              <div className="text-sm font-medium">45 min</div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="rounded-full p-2 bg-orange-100 dark:bg-orange-900">
                <Apple className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Grilled Chicken Salad</p>
                <p className="text-sm text-muted-foreground">Today at 12:00 PM</p>
              </div>
              <div className="text-sm font-medium">450 cal</div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Weight Updated</p>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
              <div className="text-sm font-medium">-0.5 lbs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
