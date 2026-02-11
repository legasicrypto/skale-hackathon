'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#001520] text-white px-6 py-16">
      <h1 className="text-3xl font-bold">Dashboard (EVM)</h1>
      <p className="mt-4 text-[#8a9aa8]">
        This UI will be wired to EVM contracts (Core/Lending/LP/GAD) next.
      </p>
      <div className="mt-8">
        <Link href="/" className="underline">Back</Link>
      </div>
    </main>
  );
}
