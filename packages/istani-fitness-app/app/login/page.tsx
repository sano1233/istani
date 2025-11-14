import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Log in to continue your fitness journey
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
