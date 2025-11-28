import Link from 'next/link';
export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 p-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Istani Swarm</h1>
        <Link href="/builder" className="bg-white text-gray-900 px-6 py-3 rounded font-bold">Launch Builder</Link>
      </div>
    </div>
  )
}
