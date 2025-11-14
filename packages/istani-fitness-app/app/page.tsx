import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Dumbbell, Apple, TrendingUp, Users, Star, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-balance">
                Transform Your Health with{' '}
                <span className="text-primary">ISTANI Fitness</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Complete fitness platform with personalized workout plans, nutrition guidance,
                and AI-powered coaching. Start your transformation journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" asChild>
                  <Link href="/dashboard">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg" asChild>
                  <Link href="/features">Learn More</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 border-2 border-background"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">10,000+ happy members</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 p-8">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-card rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <Dumbbell className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">500+</p>
                      <p className="text-sm text-muted-foreground">Workouts</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <Apple className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">1000+</p>
                      <p className="text-sm text-muted-foreground">Recipes</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">AI</p>
                      <p className="text-sm text-muted-foreground">Coaching</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 flex flex-col justify-between shadow-lg">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">Live</p>
                      <p className="text-sm text-muted-foreground">Community</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive fitness tools and features designed to help you reach your goals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-xl border ${
                  plan.featured ? 'border-primary shadow-xl scale-105' : 'bg-card'
                }`}
              >
                {plan.featured && (
                  <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  ${plan.price}
                  <span className="text-lg text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.featured ? 'default' : 'outline'} asChild>
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of people achieving their fitness goals with ISTANI
          </p>
          <Button size="lg" variant="secondary" className="text-lg" asChild>
            <Link href="/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 ISTANI Fitness Enterprise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Dumbbell,
    title: 'Personalized Workouts',
    description: 'Custom workout plans tailored to your goals, fitness level, and available equipment',
  },
  {
    icon: Apple,
    title: 'Meal Planning',
    description: 'Nutrition guidance with meal plans and macro tracking for optimal results',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your progress with detailed analytics and body composition tracking',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with like-minded individuals and share your fitness journey',
  },
  {
    icon: Star,
    title: 'AI Coaching',
    description: 'Get personalized recommendations and form feedback from AI-powered coaching',
  },
  {
    icon: Check,
    title: 'Expert Content',
    description: 'Access to professional workout videos and nutrition education',
  },
]

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      'Basic workout plans',
      'Meal suggestions',
      'Progress tracking',
      'Community access',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Pro',
    price: 19,
    features: [
      'Everything in Free',
      'Personalized AI coaching',
      'Custom meal plans',
      'Advanced analytics',
      'Video library access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Elite',
    price: 49,
    features: [
      'Everything in Pro',
      '1-on-1 coaching sessions',
      'Custom programming',
      'Nutrition consultation',
      'Exclusive community',
      'Live Q&A sessions',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
]
