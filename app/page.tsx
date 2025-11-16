import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-screen px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background-dark to-background-dark" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-6xl font-black tracking-tighter text-white md:text-8xl">
            TRANSFORM YOUR
            <span className="text-primary"> FITNESS</span>
          </h1>
          <p className="mb-8 text-xl text-white/80 md:text-2xl">
            Science-backed training. Premium supplements. Real results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border rounded-xl border-white/10 bg-white/5">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
              science
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">
              Truth Fitness Science
            </h3>
            <p className="text-white/60">
              Evidence-based training programs backed by scientific research and
              real-world results.
            </p>
          </div>

          <div className="p-8 border rounded-xl border-white/10 bg-white/5">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
              shopping_bag
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">
              Premium Products
            </h3>
            <p className="text-white/60">
              High-quality supplements and equipment tested and approved by
              professionals.
            </p>
          </div>

          <div className="p-8 border rounded-xl border-white/10 bg-white/5">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
              trending_up
            </span>
            <h3 className="text-2xl font-bold text-white mb-4">
              Track Progress
            </h3>
            <p className="text-white/60">
              Advanced analytics to monitor your fitness journey and achieve
              your goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-5xl font-black text-white">
            Ready to Transform?
          </h2>
          <p className="mb-8 text-xl text-white/80">
            Join thousands of athletes achieving their fitness goals with Istani.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
