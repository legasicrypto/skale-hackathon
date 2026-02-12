'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#001520] text-white flex flex-col gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001520]/80 backdrop-blur-xl border-b border-[#0a2535]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/legasi-logo.svg" alt="Legasi" className="h-7 w-auto" />
            <span className="text-sm text-[#5a6a78]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/faucet" className="text-sm text-[#8a9aa8] hover:text-white">Faucet</a>
            <button className="h-9 px-4 bg-white text-black rounded-lg">Connect Wallet</button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Agent Credit + Yield</h1>
              <p className="text-[#8a9aa8] mt-2">SKALE Base Sepolia • ETH / WBTC collateral • USDC.e borrow</p>
            </div>
            <div className="flex gap-3">
              <button className="h-11 px-5 bg-[#FF4E00] hover:bg-[#E64500] rounded-lg font-semibold">Run demo</button>
              <button className="h-11 px-5 bg-[#0a2535] border border-[#1a3545] rounded-lg">Docs</button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid md:grid-cols-4 gap-4 mt-10">
            <KPI title="Collateral" value="$0" sub="ETH + WBTC" />
            <KPI title="Borrowed" value="$0" sub="USDC.e" />
            <KPI title="Health Factor" value="—" sub="Target > 1.2" />
            <KPI title="Reputation" value="0" sub="Build to unlock LTV bonus" />
          </div>

          {/* Main panels */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Left: Position */}
            <div className="lg:col-span-1 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
              <h2 className="text-lg font-semibold">Position</h2>
              <p className="text-sm text-[#6a7a88] mt-1">Initialize once to create your on-chain position.</p>
              <button className="mt-4 w-full h-11 bg-[#FF4E00] hover:bg-[#E64500] rounded-lg font-semibold">Initialize Position</button>
              <div className="mt-6 text-sm text-[#8a9aa8]">Connected: not connected</div>
            </div>

            {/* Center: Credit */}
            <div className="lg:col-span-1 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
              <h2 className="text-lg font-semibold">Credit Actions</h2>
              <p className="text-sm text-[#6a7a88] mt-1">Deposit ETH/WBTC as collateral, borrow USDC.e, then repay.</p>
              <div className="mt-4 grid gap-3">
                <Action label="Approve USDC.e" />
                <Action label="Deposit Collateral" />
                <Action label="Borrow USDC.e" />
                <Action label="Approve Repay" />
                <Action label="Repay USDC.e" />
              </div>
            </div>

            {/* Right: Yield */}
            <div className="lg:col-span-1 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
              <h2 className="text-lg font-semibold">Yield Actions</h2>
              <p className="text-sm text-[#6a7a88] mt-1">Deposit USDC.e into LP vault and withdraw shares.</p>
              <div className="mt-4 grid gap-3">
                <Action label="Approve USDC.e → LP" />
                <Action label="LP Deposit" />
                <Action label="LP Withdraw" />
              </div>
            </div>
          </div>

          {/* Protocol stats */}
          <div className="mt-10 p-6 bg-[#051525]/80 border border-[#0a2535] rounded-2xl">
            <h2 className="text-lg font-semibold">Protocol Stats</h2>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <KPI title="TVL" value="$—" sub="LP + Collateral" />
              <KPI title="Utilization" value="—" sub="Borrowed / LP" />
              <KPI title="Max LTV" value="75%" sub="+ reputation bonus" />
              <KPI title="Liquidations" value="GAD" sub="Gradual deleveraging" />
            </div>
          </div>

          <div className="mt-10">
            <Link href="/" className="text-sm text-[#8a9aa8] hover:text-white">← Back</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPI({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="p-4 bg-[#00111a]/60 border border-[#0a2535] rounded-xl">
      <div className="text-xs text-[#5a6a78] uppercase tracking-widest">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs text-[#6a7a88] mt-1">{sub}</div>
    </div>
  );
}

function Action({ label }: { label: string }) {
  return (
    <button className="h-11 px-4 bg-[#0a2535] border border-[#1a3545] rounded-lg hover:bg-[#0d3040] text-left">
      {label}
    </button>
  );
}
