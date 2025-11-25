import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Enterprise-grade 404 page
 * Handles all not-found errors
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-dark">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-primary mb-4">404</h1>
          <h2 className="text-4xl font-black text-white mb-4">Page Not Found</h2>
          <p className="text-xl text-white/70 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg">Return Home</Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline">
              Browse Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <Link
            href="/workouts"
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-3xl block mb-2">
              fitness_center
            </span>
            <p className="text-sm text-white font-semibold">Workouts</p>
          </Link>

          <Link
            href="/nutrition"
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-3xl block mb-2">
              restaurant
            </span>
            <p className="text-sm text-white font-semibold">Nutrition</p>
          </Link>

          <Link
            href="/dashboard"
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-3xl block mb-2">
              dashboard
            </span>
            <p className="text-sm text-white font-semibold">Dashboard</p>
          </Link>

          <Link
            href="/register"
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-3xl block mb-2">
              person_add
            </span>
            <p className="text-sm text-white font-semibold">Sign Up</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
