import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-4xl font-bold">ISTANI</h1>
      <p>Evidence based fitness.</p>
      <Link className="underline" href="/gallery">
        Open Gallery
      </Link>
    </main>
  );
}
