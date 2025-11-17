import Link from 'next/link';
import { Dumbbell, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Elite Coaching - Istani Fitness',
  description: 'Transform your body with 1-on-1 elite coaching',
};

export default function CoachingPage() {
  const plans = [
    {
      name: 'Onboarding Session',
      price: 297,
      description: 'Get started with professional assessment',
      features: [
        'Complete fitness assessment',
        'Body composition analysis',
        'Custom workout plan creation',
        'Nutrition blueprint',
        '90-day roadmap',
        'Email support for 30 days',
      ],
    },
    {
      name: 'Weekly Coaching',
      price: 497,
      description: 'Weekly check-ins and accountability',
      features: [
        'Weekly 1-on-1 video calls',
        'Custom workout programming',
        'Personalized meal plans',
        'Form check videos',
        'Email & text support',
        'Monthly progress reviews',
      ],
    },
    {
      name: 'Elite Monthly Coaching',
      price: 1997,
      description: 'Premium transformation program',
      featured: true,
      features: [
        '4 Weekly 1-on-1 coaching calls',
        '24/7 direct coach access',
        'Fully customized programming',
        'Advanced supplement protocols',
        'Bi-weekly body composition scans',
        'Mindset & habit coaching',
        'Exclusive community access',
        'Lifetime program library access',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white shadow-sm z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-brand-primary" />
              <span className="text-2xl font-display font-bold text-brand-dark">Istani</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/products" className="text-gray-700 hover:text-brand-primary transition">
                Shop
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-brand-primary transition">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Elite 1-on-1 Coaching
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Work directly with certified fitness experts who have transformed 1000+ bodies.
            Science-based programming meets personalized accountability.
          </p>
          <div className="flex items-center justify-center gap-8 text-lg">
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-white/80">Transformations</div>
            </div>
            <div>
              <div className="text-3xl font-bold">15+</div>
              <div className="text-white/80">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="container-custom py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.featured ? 'border-4 border-brand-primary relative' : ''}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-sm text-brand-primary font-semibold uppercase tracking-wide mb-2">
                    {plan.name}
                  </div>
                  <div className="text-4xl font-display font-bold mb-2">
                    ${plan.price}
                    {plan.name !== 'Onboarding Session' && (
                      <span className="text-lg text-gray-600">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-normal">{plan.description}</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:istaniDOTstore@proton.me?subject=Coaching Inquiry - ${plan.name}"
                  className={`block text-center py-3 rounded-lg font-semibold transition ${
                    plan.featured
                      ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to Transform Your Body?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book a free 15-minute consultation to discuss your goals and find the perfect coaching
            plan
          </p>
          <a
            href="mailto:istaniDOTstore@proton.me?subject=Free Coaching Consultation"
            className="btn-primary text-lg px-8 py-4"
          >
            Book Free Consultation
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12">
        <div className="container-custom text-center">
          <p className="text-gray-400 mb-2">Contact: istaniDOTstore@proton.me</p>
          <a
            href="https://buymeacoffee.com/istanifitn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg transition mt-4"
          >
            ☕ Buy Me a Coffee
          </a>
          <p className="text-gray-400 mt-8">&copy; 2025 Istani Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
