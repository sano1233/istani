import fitnessData from '../../../content/fitness-science.json';
import Image from 'next/image';

export const metadata = {
  title: 'Fitness Science | Evidence-Based Training - Istani Fitness',
  description: 'Comprehensive exercise database with peer-reviewed research, proper form guides, and science-backed nutrition protocols for optimal fitness results.',
};

export default function FitnessScience() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-cyan-500 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=400&fit=crop"
          alt="Fitness Training"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative z-10 max-w-6xl mx-auto px-8 h-full flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Evidence-Based Fitness Science</h1>
          <p className="text-xl text-white/90 max-w-2xl">Peer-reviewed research meets practical application for optimal training results</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 py-16">
        
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Exercise Database</h2>
          <div className="grid gap-8">
          {fitnessData.exercises.map((exercise, i) => (
            <article key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64">
                <Image
                  src={`https://images.unsplash.com/photo-${i === 0 ? '1574680096145-d05b474e2155' : i === 1 ? '1517344884509-a0c97ec11bcc' : '1571019614242-c5c5dee9f50b'}?w=800&h=400&fit=crop`}
                  alt={exercise.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8">
              <h3 className="text-3xl font-bold mb-4 text-gray-900">{exercise.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {exercise.muscleGroups.map((muscle, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{muscle}</span>
                ))}
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">SCIENTIFIC EVIDENCE</p>
                  <p className="text-gray-800">{exercise.science}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">PROPER FORM</p>
                  <p className="text-gray-700">{exercise.form}</p>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{exercise.sets}</p>
                    <p className="text-sm text-gray-600">Sets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{exercise.reps}</p>
                    <p className="text-sm text-gray-600">Reps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{exercise.restSeconds}s</p>
                    <p className="text-sm text-gray-600">Rest</p>
                  </div>
                </div>
              </div>
              </div>
            </article>
          ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Nutrition Guidelines</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🥩</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Protein</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">{fitnessData.nutrition.protein.dailyGrams}</p>
              <p className="text-gray-800 mb-4 leading-relaxed">{fitnessData.nutrition.protein.science}</p>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">TOP SOURCES</p>
                <p className="text-sm text-gray-700">{fitnessData.nutrition.protein.sources.join(' • ')}</p>
              </div>
            </article>
            <article className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🍠</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Carbohydrates</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">{fitnessData.nutrition.carbohydrates.dailyGrams}</p>
              <p className="text-gray-800 mb-4 leading-relaxed">{fitnessData.nutrition.carbohydrates.science}</p>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">TOP SOURCES</p>
                <p className="text-sm text-gray-700">{fitnessData.nutrition.carbohydrates.sources.join(' • ')}</p>
              </div>
            </article>
            <article className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🥑</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Fats</h3>
              <p className="text-3xl font-bold text-orange-600 mb-4">{fitnessData.nutrition.fats.dailyGrams}</p>
              <p className="text-gray-800 mb-4 leading-relaxed">{fitnessData.nutrition.fats.science}</p>
              <div className="bg-white/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">TOP SOURCES</p>
                <p className="text-sm text-gray-700">{fitnessData.nutrition.fats.sources.join(' • ')}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Recovery Science</h2>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl">
                <div className="text-4xl mb-3">😴</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Sleep</h3>
                <p className="text-3xl font-bold text-purple-600 mb-3">{fitnessData.recovery.sleep.hours} hours</p>
                <p className="text-gray-700 text-sm">{fitnessData.recovery.sleep.science}</p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="text-4xl mb-3">💧</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Hydration</h3>
                <p className="text-3xl font-bold text-blue-600 mb-3">{fitnessData.recovery.hydration.liters} liters</p>
                <p className="text-gray-700 text-sm">{fitnessData.recovery.hydration.science}</p>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <div className="text-4xl mb-3">🔄</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Rest Days</h3>
                <p className="text-3xl font-bold text-pink-600 mb-3">{fitnessData.recovery.restDays.perWeek}/week</p>
                <p className="text-gray-700 text-sm">{fitnessData.recovery.restDays.science}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Scientific References</h2>
          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-600">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              {fitnessData.citations.map((citation, i) => (
                <li key={i}>{citation}</li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
