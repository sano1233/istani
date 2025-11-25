import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { neon } from '@neondatabase/serverless';

export default function HomePage() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-screen px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background-dark to-background-dark" />
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/hero-bg.svg"
            alt="Background pattern"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-6xl font-black tracking-tighter text-white md:text-8xl">
            TRANSFORM YOUR
            <span className="text-primary"> FITNESS</span>
          </h1>
          <p className="mb-4 text-xl text-white/90 md:text-2xl font-semibold">
            Evidence-Based Training • Premium Nutrition • Real Results
          </p>
          <p className="mb-8 text-lg text-white/70 max-w-2xl mx-auto">
            Istani combines cutting-edge exercise science, personalized nutrition coaching, and advanced progress tracking to help you achieve sustainable fitness transformations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="text-lg px-8">Shop Premium Supplements</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Start Free 14-Day Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-4 py-24 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Why Choose Istani?</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We cut through the fitness industry noise with evidence-based methodologies proven by peer-reviewed research and real athlete outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/feature-science.svg"
                  alt="Evidence-based science"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Evidence-Based Science</h3>
              <p className="text-white/70 mb-4">
                Every training program is built on peer-reviewed research from exercise physiology, biomechanics, and sports nutrition studies.
              </p>
              <ul className="text-white/60 space-y-2 text-sm">
                <li>✓ Progressive overload periodization</li>
                <li>✓ Optimized rep ranges for hypertrophy</li>
                <li>✓ Evidence-based recovery protocols</li>
                <li>✓ Validated measurement techniques</li>
              </ul>
            </div>

            <div className="p-8 border rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/feature-products.svg"
                  alt="Premium products"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Premium Supplements</h3>
              <p className="text-white/70 mb-4">
                Third-party tested supplements with transparent labeling. No proprietary blends, no false promises—just proven ingredients at effective doses.
              </p>
              <ul className="text-white/60 space-y-2 text-sm">
                <li>✓ NSF Certified for Sport tested</li>
                <li>✓ No banned substances</li>
                <li>✓ Clinical dosages guaranteed</li>
                <li>✓ Full ingredient transparency</li>
              </ul>
            </div>

            <div className="p-8 border rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/feature-tracking.svg"
                  alt="Progress tracking"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
              <p className="text-white/70 mb-4">
                Track every metric that matters: strength gains, body composition changes, workout volume, nutrition adherence, and recovery markers.
              </p>
              <ul className="text-white/60 space-y-2 text-sm">
                <li>✓ Comprehensive workout logging</li>
                <li>✓ Body composition tracking</li>
                <li>✓ Nutrition compliance metrics</li>
                <li>✓ Performance trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Training Philosophy */}
      <section className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6">Our Training Philosophy</h2>
              <div className="space-y-4 text-white/80">
                <p className="text-lg">
                  <span className="text-primary font-bold">Progressive Overload:</span> Systematic increases in training stimulus through volume, intensity, or frequency to drive continuous adaptation.
                </p>
                <p className="text-lg">
                  <span className="text-primary font-bold">Periodization:</span> Structured training phases that optimize hypertrophy, strength, and recovery across mesocycles and macrocycles.
                </p>
                <p className="text-lg">
                  <span className="text-primary font-bold">Individual Response:</span> Personalized programming based on training age, recovery capacity, and biomechanical factors.
                </p>
                <p className="text-lg">
                  <span className="text-primary font-bold">Recovery Science:</span> Deloads, sleep optimization, and nutrition timing to maximize muscle protein synthesis and minimize injury risk.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xl font-bold text-primary mb-2">Hypertrophy Training</h4>
                <p className="text-white/70">6-20 rep ranges, 3-5 sets per exercise, controlled tempo with 1-2 minutes rest for metabolic stress and mechanical tension.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xl font-bold text-primary mb-2">Strength Development</h4>
                <p className="text-white/70">1-6 rep ranges, compound movements, longer rest periods (3-5 min) for maximal neural adaptation and force production.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xl font-bold text-primary mb-2">Metabolic Conditioning</h4>
                <p className="text-white/70">High-intensity interval training designed to improve VO2 max and lactate threshold without interfering with strength gains.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Science */}
      <section className="px-4 py-24 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Nutrition That Works</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Forget fad diets. Our nutrition approach is built on energy balance, macronutrient optimization, and meal timing research.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-4xl font-black text-primary mb-4">1.6-2.2g</div>
              <h4 className="text-xl font-bold text-white mb-3">Protein per kg</h4>
              <p className="text-white/70">
                Optimal protein intake for muscle protein synthesis based on meta-analyses of nitrogen balance studies.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-4xl font-black text-primary mb-4">0.8-1.2g</div>
              <h4 className="text-xl font-bold text-white mb-3">Fat per kg</h4>
              <p className="text-white/70">
                Essential for hormone production, vitamin absorption, and satiety while allowing sufficient carbohydrate intake.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-4xl font-black text-primary mb-4">3-7g</div>
              <h4 className="text-xl font-bold text-white mb-3">Carbs per kg</h4>
              <p className="text-white/70">
                Carbohydrate intake scaled to training volume for glycogen repletion and performance optimization.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Our Nutritional Framework</h3>
            <div className="grid md:grid-cols-2 gap-6 text-white/80">
              <div>
                <p className="mb-4">
                  <span className="font-bold text-primary">Energy Balance:</span> Caloric intake aligned with goals—controlled deficit for fat loss (-300 to -500 kcal), surplus for muscle gain (+200 to +400 kcal).
                </p>
                <p>
                  <span className="font-bold text-primary">Nutrient Timing:</span> Protein distributed across 4-6 meals for elevated muscle protein synthesis throughout the day. Carbs prioritized around training.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  <span className="font-bold text-primary">Micronutrients:</span> Emphasis on nutrient-dense whole foods to meet vitamin and mineral requirements for optimal health and performance.
                </p>
                <p>
                  <span className="font-bold text-primary">Adherence:</span> Flexible dieting approach allowing 80-90% whole foods with room for food preferences to ensure long-term sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Complete Fitness Platform</h2>
            <p className="text-xl text-white/70">Everything you need to build your best physique</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-primary text-4xl mb-3 block">fitness_center</span>
              <h4 className="text-lg font-bold text-white mb-2">Custom Workouts</h4>
              <p className="text-white/60 text-sm">Personalized training programs based on your experience, goals, and available equipment.</p>
            </div>

            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-primary text-4xl mb-3 block">restaurant</span>
              <h4 className="text-lg font-bold text-white mb-2">Meal Planning</h4>
              <p className="text-white/60 text-sm">Macro-optimized meal plans with recipes and grocery lists tailored to your caloric needs.</p>
            </div>

            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-primary text-4xl mb-3 block">analytics</span>
              <h4 className="text-lg font-bold text-white mb-2">Progress Dashboard</h4>
              <p className="text-white/60 text-sm">Visual analytics showing strength gains, body composition changes, and training volume.</p>
            </div>

            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-primary text-4xl mb-3 block">psychology</span>
              <h4 className="text-lg font-bold text-white mb-2">AI Coaching</h4>
              <p className="text-white/60 text-sm">Intelligent form analysis and training recommendations powered by machine learning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 bg-gradient-to-br from-primary/20 to-background-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-5xl font-black text-white">Start Your Transformation Today</h2>
          <p className="mb-8 text-xl text-white/80">
            Join thousands of athletes who have transformed their physiques with evidence-based training and nutrition science.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">Start Free 14-Day Trial</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-8">Browse Supplements</Button>
            </Link>
          </div>
          <p className="text-white/60 text-sm">No credit card required • Cancel anytime • 100% money-back guarantee</p>
        </div>
      </section>

      {/* Comments Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-6 text-3xl font-bold text-white text-center">Join the Community</h2>
          <p className="text-center text-white/70 mb-8">Share your thoughts, questions, or fitness journey with us</p>
          <form action={create} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Share your thoughts..."
              name="comment"
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit Comment
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
